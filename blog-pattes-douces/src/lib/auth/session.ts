"use client";

import { useSyncExternalStore } from "react";
import { fetchMe } from "@/lib/api-client";

/**
 * Identite de l'utilisateur courant, cote navigateur.
 *
 * La source de verite est la session SERVEUR (cookie httpOnly `pd_session`,
 * illisible par JavaScript) : ce module n'en garde qu'une copie d'affichage,
 * obtenue par GET /api/auth/me. Elle sert a adapter l'interface (menu, boutons) ;
 * chaque action est de toute facon re-verifiee par le serveur, qui ignore
 * tout identifiant envoye par le client.
 */

export type CurrentUser = { id: string; pseudo: string; espece?: string | null };

type SessionState = {
  /** false tant que /api/auth/me n'a pas repondu (et pendant le rendu serveur). */
  ready: boolean;
  user: CurrentUser | null;
};

const UNKNOWN: SessionState = { ready: false, user: null };

let state: SessionState = UNKNOWN;
// Incremente a chaque changement local : une reponse de /me partie avant un
// login ou un logout ne doit pas ecraser l'etat plus recent.
let version = 0;
let started = false;
const listeners = new Set<() => void>();

function emit(next: SessionState) {
  state = next;
  version += 1;
  listeners.forEach((listener) => listener());
}

/** Interroge le serveur et met la copie locale a jour. */
export async function refreshSession(): Promise<void> {
  const requested = version;
  let user: CurrentUser | null = null;
  try {
    user = await fetchMe();
  } catch {
    // Reseau ou serveur indisponible : on garde l'etat connu (visiteur au premier chargement).
    if (state.ready) return;
  }
  if (requested !== version) return;
  const same =
    state.ready &&
    state.user?.id === user?.id &&
    state.user?.pseudo === user?.pseudo &&
    state.user?.espece === user?.espece;
  if (!same) emit({ ready: true, user });
}

/** Apres une connexion reussie : le serveur a pose le cookie, on connait l'utilisateur. */
export function setSessionUser(user: CurrentUser): void {
  emit({ ready: true, user });
}

/** Apres une deconnexion ou une suppression de compte (le serveur a detruit la session). */
export function clearSession(): void {
  emit({ ready: true, user: null });
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  void refreshSession();
  // Une connexion ou une deconnexion dans un autre onglet est reprise au retour.
  window.addEventListener("focus", () => void refreshSession());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => UNKNOWN;

function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* --- Hooks --- */

export function useIsLoggedIn(): boolean {
  return useSession().user !== null;
}

export function usePseudo(): string | null {
  return useSession().user?.pseudo ?? null;
}

export function useUserId(): string | null {
  return useSession().user?.id ?? null;
}

export function useSpecies(): string | null {
  return useSession().user?.espece ?? null;
}

/**
 * true quand la session est connue (reponse de /api/auth/me recue). Avant,
 * on ne sait pas encore si le visiteur est connecte : il ne faut ni le
 * rediriger ni lui montrer le bandeau visiteur.
 */
export function useSessionReady(): boolean {
  return useSession().ready;
}

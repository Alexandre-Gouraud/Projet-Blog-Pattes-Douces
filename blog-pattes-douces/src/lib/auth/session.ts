"use client";

import { useSyncExternalStore } from "react";

/**
 * Identite de l'utilisateur courant.
 *
 * ATTENTION : aujourd'hui l'identite vit uniquement dans le localStorage et
 * n'est jamais verifiee cote serveur. Ce module centralise les acces pour
 * qu'une vraie session (cookie httpOnly) puisse les remplacer en un seul
 * endroit. Voir la section "Hors perimetre" du plan de restructuration.
 */

const PSEUDO_KEY = "pseudo";
const USER_ID_KEY = "user_id";

export type CurrentUser = { id: string; pseudo: string };

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getUserId(): string | null {
  return read(USER_ID_KEY);
}

export function getPseudo(): string | null {
  return read(PSEUDO_KEY);
}

export function isLoggedIn(): boolean {
  return getPseudo() !== null;
}

export function saveSession(user: CurrentUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PSEUDO_KEY, user.pseudo);
  localStorage.setItem(USER_ID_KEY, user.id);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PSEUDO_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

/* --- Hooks --- */

/**
 * Le localStorage est une source externe a React : on le lit via
 * useSyncExternalStore plutot que dans un useEffect + setState, ce qui evite
 * les rendus en cascade et reste correct au rendu serveur.
 */
function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function useIsLoggedIn(): boolean {
  return useSyncExternalStore(subscribe, isLoggedIn, () => false);
}

export function usePseudo(): string | null {
  return useSyncExternalStore(subscribe, getPseudo, () => null);
}

export function useUserId(): string | null {
  return useSyncExternalStore(subscribe, getUserId, () => null);
}

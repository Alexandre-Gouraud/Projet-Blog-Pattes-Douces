import { DEFAULT_LOCALE, type Locale, isLocale } from "@/i18n/config";
import { modelRoute } from "./models";
import type { WorkerRequest, WorkerResponse } from "./protocol";

/**
 * Traduction des contenus des membres (articles, commentaires) dans la langue
 * de l'interface, avec la librairie Transformers.js et des modeles Opus-MT
 * executes dans un Web Worker. Modeles et moteur sont servis par le site :
 * le texte ne quitte jamais l'appareil et aucun service tiers n'est appele.
 *
 * Pour que ce soit rapide : un seul worker pour toute la page, modeles
 * charges une fois (puis gardes en cache par le navigateur), prechauffage au
 * survol ou au focus du bouton, affichage au fil de la traduction et
 * traductions deja faites gardees pour la session.
 */

/** Langue d'origine d'un contenu ; les contenus anterieurs au champ `langue` sont en francais. */
export function sourceLocale(langue: string | null | undefined): Locale {
  return isLocale(langue) ? langue : DEFAULT_LOCALE;
}

export type TranslateOptions = {
  /** Avancement du chargement des modeles (0 a 1). */
  onProgress?: (loaded: number) => void;
  /** Traduction partielle d'un texte, au fil du calcul. */
  onPartial?: (index: number, partial: string) => void;
};

type Pending = TranslateOptions & { resolve: (texts: string[]) => void; reject: (error: Error) => void };

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./translation.worker.ts", import.meta.url), { type: "module" });
  worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
    const message = event.data;
    const request = pending.get(message.id);
    if (!request) return;
    if (message.type === "progress") request.onProgress?.(message.loaded);
    else if (message.type === "partial") request.onPartial?.(message.index, message.text);
    else {
      pending.delete(message.id);
      if (message.type === "done") request.resolve(message.texts);
      else request.reject(new Error(message.message));
    }
  });
  // Worker inutilisable (fichiers absents...) : toutes les demandes en cours echouent.
  worker.addEventListener("error", () => {
    for (const request of pending.values()) request.reject(new Error("Worker de traduction indisponible"));
    pending.clear();
    worker = null;
  });
  return worker;
}

function send(message: WorkerRequest) {
  getWorker().postMessage(message);
}

/** Commence a charger les modeles d'une paire avant le clic (survol, focus). */
export function warmUp(source: Locale, target: Locale): void {
  const models = modelRoute(source, target);
  if (models.length > 0) send({ type: "warm", models });
}

/* --- Traductions deja faites (memoire + sessionStorage) --- */

const memory = new Map<string, string>();

function resultKey(text: string, source: Locale, target: Locale): string {
  // Empreinte FNV-1a 32 bits : courte et suffisante pour une cle de cache.
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `pd-tr:${source}>${target}:${text.length}:${hash.toString(36)}`;
}

function cachedResult(key: string): string | null {
  const hit = memory.get(key);
  if (hit !== undefined) return hit;
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function storeResult(key: string, value: string) {
  memory.set(key, value);
  try {
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(key, value);
  } catch {
    // Stockage plein ou indisponible : le cache memoire suffit.
  }
}

/** Traduit plusieurs textes ; ceux deja traduits dans la session sont rendus tout de suite. */
export async function translateTexts(
  texts: string[],
  source: Locale,
  target: Locale,
  options: TranslateOptions = {},
): Promise<string[]> {
  const keys = texts.map((text) => resultKey(text, source, target));
  const cached = keys.map(cachedResult);
  const missing = texts.map((_, i) => i).filter((i) => cached[i] === null);
  if (missing.length === 0) return cached as string[];

  const models = modelRoute(source, target);
  const id = nextId++;
  const translated = await new Promise<string[]>((resolve, reject) => {
    pending.set(id, {
      resolve,
      reject,
      onProgress: options.onProgress,
      onPartial: options.onPartial && ((index, partial) => options.onPartial?.(missing[index], partial)),
    });
    send({ type: "translate", id, models, texts: missing.map((i) => texts[i]) });
  });

  const results = [...cached];
  missing.forEach((i, position) => {
    results[i] = translated[position];
    storeResult(keys[i], translated[position]);
  });
  return results as string[];
}

import type { Locale } from "@/i18n/config";

/**
 * Modeles Opus-MT disponibles : de et vers l'anglais, plus le francais et
 * l'arabe en direct (convertis localement, voir scripts/convert-opus-mt.py).
 * Les autres paires passent par l'anglais (pivot). Doit rester aligne sur
 * MODELS et LOCAL_MODELS dans scripts/translation-assets.mjs, qui les
 * installent dans public/models.
 */
export const MODEL_IDS = {
  "fr>en": "Xenova/opus-mt-fr-en",
  "en>fr": "Xenova/opus-mt-en-fr",
  "ar>en": "Xenova/opus-mt-ar-en",
  "en>ar": "Xenova/opus-mt-en-ar",
  "zh>en": "Xenova/opus-mt-zh-en",
  "en>zh": "Xenova/opus-mt-en-zh",
  "fr>ar": "local/opus-mt-fr-ar",
  "ar>fr": "local/opus-mt-ar-fr",
} as const;

export type ModelId = (typeof MODEL_IDS)[keyof typeof MODEL_IDS];

/** Modeles a enchainer pour traduire de `source` vers `target` (vide si meme langue). */
export function modelRoute(source: Locale, target: Locale): ModelId[] {
  if (source === target) return [];
  const direct = MODEL_IDS[`${source}>${target}` as keyof typeof MODEL_IDS] as ModelId | undefined;
  if (direct) return [direct];
  return [MODEL_IDS[`${source}>en` as keyof typeof MODEL_IDS], MODEL_IDS[`en>${target}` as keyof typeof MODEL_IDS]];
}

/**
 * Route de secours par l'anglais pour une paire qui a un modele direct (fr<->ar,
 * convertis localement et donc parfois absents) ; undefined sinon.
 */
export function pivotFallback(source: Locale, target: Locale): ModelId[] | undefined {
  if (source === "en" || target === "en" || modelRoute(source, target).length !== 1) return undefined;
  return [MODEL_IDS[`${source}>en` as keyof typeof MODEL_IDS], MODEL_IDS[`en>${target}` as keyof typeof MODEL_IDS]];
}

/**
 * Charge les modeles d'une route ; si l'un d'eux ne peut pas l'etre (fichier
 * absent...) et qu'une route de secours existe, charge celle-ci a la place.
 */
export async function loadRoute<T>(
  route: ModelId[],
  fallback: ModelId[] | undefined,
  load: (model: ModelId, index: number, count: number) => Promise<T>,
): Promise<T[]> {
  try {
    return await Promise.all(route.map((model, index) => load(model, index, route.length)));
  } catch (error) {
    if (!fallback || fallback.length === 0) throw error;
    return Promise.all(fallback.map((model, index) => load(model, index, fallback.length)));
  }
}

/** Longueur maximale d'un segment envoye au modele (Opus-MT est entraine sur des phrases). */
const MAX_SEGMENT = 400;

/**
 * Decoupe un texte en segments a traduire un par un : par paragraphe, puis
 * par phrase pour les paragraphes longs. Les separateurs (sauts de ligne)
 * sont conserves a part pour reconstruire le texte a l'identique.
 */
export function splitForTranslation(text: string): { segments: string[]; separators: string[] } {
  const segments: string[] = [];
  const separators: string[] = [];
  const parts = text.split(/(\n+)/);
  for (let i = 0; i < parts.length; i += 2) {
    const paragraph = parts[i];
    const after = parts[i + 1] ?? "";
    const pieces =
      paragraph.length > MAX_SEGMENT ? (paragraph.match(/[^.!?。！？]+[.!?。！？]*\s*/g) ?? [paragraph]) : [paragraph];
    pieces.forEach((piece, index) => {
      // L'espace qui suit une phrase n'est pas traduit : il est remis tel quel.
      const trimmed = piece.trimEnd();
      const trailing = piece.slice(trimmed.length);
      segments.push(trimmed);
      separators.push(index === pieces.length - 1 ? trailing + after : trailing);
    });
  }
  return { segments, separators };
}

/** Recompose le texte traduit avec les separateurs d'origine. */
export function joinTranslated(segments: string[], separators: string[]): string {
  return segments.map((segment, i) => segment + (separators[i] ?? "")).join("");
}

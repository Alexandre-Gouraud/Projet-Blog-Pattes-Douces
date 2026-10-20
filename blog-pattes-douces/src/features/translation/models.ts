import type { Locale } from "@/i18n/config";

/**
 * Modeles Opus-MT disponibles : de et vers l'anglais. Les autres paires
 * passent par l'anglais (pivot). Doit rester aligne sur MODELS dans
 * scripts/translation-assets.mjs, qui les installe dans public/models.
 */
export const MODEL_IDS = {
  "fr>en": "Xenova/opus-mt-fr-en",
  "en>fr": "Xenova/opus-mt-en-fr",
  "ar>en": "Xenova/opus-mt-ar-en",
  "en>ar": "Xenova/opus-mt-en-ar",
  "zh>en": "Xenova/opus-mt-zh-en",
  "en>zh": "Xenova/opus-mt-en-zh",
} as const;

export type ModelId = (typeof MODEL_IDS)[keyof typeof MODEL_IDS];

/** Modeles a enchainer pour traduire de `source` vers `target` (vide si meme langue). */
export function modelRoute(source: Locale, target: Locale): ModelId[] {
  if (source === target) return [];
  if (source === "en") return [MODEL_IDS[`en>${target}` as keyof typeof MODEL_IDS]];
  if (target === "en") return [MODEL_IDS[`${source}>en` as keyof typeof MODEL_IDS]];
  return [MODEL_IDS[`${source}>en` as keyof typeof MODEL_IDS], MODEL_IDS[`en>${target}` as keyof typeof MODEL_IDS]];
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

import { DEFAULT_LOCALE, type Locale, isLocale } from "@/i18n/config";

/**
 * Traduction des contenus des membres (articles, commentaires) dans la langue
 * de l'interface.
 *
 * - Si le navigateur expose l'API Translator (Chrome 138+), la traduction est
 *   faite sur l'appareil : le texte ne quitte pas le navigateur.
 * - Sinon, on propose un lien vers Google Traduction, ouvert dans un nouvel
 *   onglet (le texte est alors envoye a Google, voir la page Confidentialite).
 */

type Availability = "unavailable" | "downloadable" | "downloading" | "available";

type LanguagePair = { sourceLanguage: string; targetLanguage: string };

/** Sous-ensemble de l'API Translator utilise ici (pas encore dans lib.dom). */
type BuiltInTranslator = { translate: (text: string) => Promise<string> };

type DownloadMonitor = {
  addEventListener: (type: "downloadprogress", listener: (event: { loaded: number }) => void) => void;
};

type TranslatorApi = {
  availability: (pair: LanguagePair) => Promise<Availability>;
  create: (options: LanguagePair & { monitor?: (monitor: DownloadMonitor) => void }) => Promise<BuiltInTranslator>;
};

export type TranslationMode = "builtin" | "external";

function translatorApi(): TranslatorApi | null {
  if (typeof self === "undefined" || !("Translator" in self)) return null;
  return (self as unknown as { Translator: TranslatorApi }).Translator;
}

/** Langue d'origine d'un contenu ; les contenus anterieurs au champ `langue` sont en francais. */
export function sourceLocale(langue: string | null | undefined): Locale {
  return isLocale(langue) ? langue : DEFAULT_LOCALE;
}

/** Traduction sur l'appareil si possible pour cette paire de langues, sinon lien externe. */
export async function translationMode(source: Locale, target: Locale): Promise<TranslationMode> {
  const api = translatorApi();
  if (!api) return "external";
  try {
    const availability = await api.availability({ sourceLanguage: source, targetLanguage: target });
    return availability === "unavailable" ? "external" : "builtin";
  } catch {
    return "external";
  }
}

// Un traducteur par paire de langues, reutilise par tous les contenus de la page.
const translators = new Map<string, Promise<BuiltInTranslator>>();

/**
 * Traduit plusieurs textes avec l'API du navigateur. `onProgress` recoit
 * l'avancement (0 a 1) si le modele de langue doit d'abord etre telecharge.
 */
export async function translateTexts(
  texts: string[],
  source: Locale,
  target: Locale,
  onProgress?: (loaded: number) => void,
): Promise<string[]> {
  const api = translatorApi();
  if (!api) throw new Error("API Translator indisponible");
  const key = `${source}>${target}`;
  let translator = translators.get(key);
  if (!translator) {
    translator = api.create({
      sourceLanguage: source,
      targetLanguage: target,
      monitor: (monitor) => monitor.addEventListener("downloadprogress", (event) => onProgress?.(event.loaded)),
    });
    translators.set(key, translator);
    // Un echec (telechargement interrompu...) ne doit pas bloquer les essais suivants.
    translator.catch(() => translators.delete(key));
  }
  const ready = await translator;
  return Promise.all(texts.map((text) => ready.translate(text)));
}

/** Codes de langue de Google Traduction (le chinois simplifie est zh-CN). */
const GOOGLE_CODES: Record<Locale, string> = { fr: "fr", en: "en", ar: "ar", zh: "zh-CN" };

/** Limite prudente : au-dela, l'URL risque d'etre refusee. */
const MAX_URL_TEXT = 4000;

export function externalTranslationUrl(text: string, source: Locale, target: Locale): string {
  const params = new URLSearchParams({
    sl: GOOGLE_CODES[source],
    tl: GOOGLE_CODES[target],
    text: text.slice(0, MAX_URL_TEXT),
    op: "translate",
  });
  return `https://translate.google.com/?${params.toString()}`;
}

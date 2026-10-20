/**
 * Langues de l'interface (DESIGN.md §11). La langue fait partie de l'URL
 * (/fr/feed, /ar/feed…), selon le guide d'internationalisation de Next.js :
 * le proxy redirige les URL sans langue, le layout racine app/[lang] la lit.
 */
export const LOCALES = ["fr", "en", "ar", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Dernier choix explicite du visiteur, prioritaire sur Accept-Language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export type LocaleInfo = {
  code: Locale;
  /** Nom de la langue ecrit dans cette langue (RGAA 8.7). */
  name: string;
  dir: "ltr" | "rtl";
  /** Drapeau decoratif, dans public/images/flags. */
  flag: string;
  /** Locale BCP 47 utilisee pour les dates (chiffres latins partout). */
  intl: string;
};

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  fr: { code: "fr", name: "Français", dir: "ltr", flag: "/images/flags/fr.svg", intl: "fr-FR" },
  en: { code: "en", name: "English", dir: "ltr", flag: "/images/flags/gb.svg", intl: "en-GB" },
  ar: { code: "ar", name: "العربية", dir: "rtl", flag: "/images/flags/arab-league.png", intl: "ar-u-nu-latn" },
  zh: { code: "zh", name: "中文", dir: "ltr", flag: "/images/flags/cn.svg", intl: "zh-CN" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Langue preferee d'apres l'en-tete Accept-Language (« ar-SA,ar;q=0.9,fr;q=0.8 ») :
 * la premiere langue supportee par ordre de qualite, sinon la langue par defaut.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return { language: tag.toLowerCase().split("-")[0], quality: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);
  return ranked.map((entry) => entry.language).find(isLocale) ?? DEFAULT_LOCALE;
}

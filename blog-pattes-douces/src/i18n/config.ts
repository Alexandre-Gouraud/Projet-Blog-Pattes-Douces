/**
 * Langues de l'interface (DESIGN.md §11). Le choix est memorise dans un
 * cookie : le serveur rend directement le bon `lang`, le bon `dir` et les bons
 * textes, sans flash au chargement.
 */
export const LOCALES = ["fr", "en", "ar", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_COOKIE = "pd-lang";

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
  ar: { code: "ar", name: "العربية", dir: "rtl", flag: "/images/flags/sa.svg", intl: "ar-u-nu-latn" },
  zh: { code: "zh", name: "中文", dir: "ltr", flag: "/images/flags/cn.svg", intl: "zh-CN" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

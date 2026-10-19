import { LOCALE_INFO, type Locale } from "./config";

/** Formes de pluriel CLDR d'un message : seule « other » est obligatoire. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export type Values = Record<string, string | number>;

/** Remplace les variables {nom} d'un message. */
export function format(message: string, values: Values = {}): string {
  return message.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

const rulesCache = new Map<Locale, Intl.PluralRules>();

/**
 * Accorde un message au nombre `count` selon les regles de la langue :
 * une forme en chinois, deux en francais et en anglais, six en arabe.
 * `{count}` et les autres variables sont remplacees.
 */
export function plural(locale: Locale, forms: PluralForms, count: number, values: Values = {}): string {
  let rules = rulesCache.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    rulesCache.set(locale, rules);
  }
  return format(forms[rules.select(count)] ?? forms.other, { count, ...values });
}

/** Date au format local JJ/MM/AAAA (AAAA/MM/JJ en chinois), chiffres latins. */
export function formatDate(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(LOCALE_INFO[locale].intl, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

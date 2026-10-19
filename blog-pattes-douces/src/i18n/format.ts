import { LOCALE_INFO, type Locale } from "./config";

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

const rulesCache = new Map<Locale, Intl.PluralRules>();

/**
 * Accorde un texte au nombre `n` selon les regles de la langue (CLDR) :
 * une seule forme en chinois, deux en francais et en anglais, six en arabe.
 * `{n}` est remplace par le nombre.
 */
export function plural(locale: Locale, n: number, forms: PluralForms): string {
  let rules = rulesCache.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    rulesCache.set(locale, rules);
  }
  const form = forms[rules.select(n)] ?? forms.other;
  return form.replace("{n}", String(n));
}

/** Date au format local JJ/MM/AAAA (ou AAAA/MM/JJ en chinois). */
export function formatDate(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(LOCALE_INFO[locale].intl, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

"use client";

import { createContext, useContext, useMemo } from "react";
import { LOCALE_INFO, type Locale } from "./config";
import { type PluralForms, type Values, format, formatDate, plural } from "./format";
import type { Messages } from "./messages";

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  /** Messages de la langue courante (structures par espace de noms). */
  t: Messages;
  /** Message avec variables : f(t.common.by, { name }). */
  f: (message: string, values?: Values) => string;
  /** Message accorde au nombre : p(t.common.count.comments, 3). */
  p: (forms: PluralForms, count: number, values?: Values) => string;
  /** Date au format de la langue. */
  date: (iso: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Donne aux Client Components la langue de l'URL et ses messages, charges
 * cote serveur par le layout racine : seul le dictionnaire de la langue
 * courante est envoye au navigateur.
 */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: LOCALE_INFO[locale].dir,
      t: messages,
      f: format,
      p: (forms, count, values) => plural(locale, forms, count, values),
      date: (iso) => formatDate(locale, iso),
    }),
    [locale, messages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n doit etre utilise sous <I18nProvider>.");
  return value;
}

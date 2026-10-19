"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_INFO, type Locale } from "./config";
import { DICTIONARIES, type Dictionary } from "./dictionaries";
import { formatDate } from "./format";

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  date: (iso: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Langue de l'interface cote client. La langue initiale vient du serveur
 * (cookie) ; un changement met a jour le cookie, `lang` et `dir` sur <html>,
 * puis rafraichit les Server Components (titre du document compris).
 */
export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = next;
      document.documentElement.dir = LOCALE_INFO[next].dir;
      setLocaleState(next);
      router.refresh();
    },
    [router],
  );

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: LOCALE_INFO[locale].dir,
      t: DICTIONARIES[locale],
      setLocale,
      date: (iso) => formatDate(locale, iso),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n doit etre utilise sous <I18nProvider>.");
  return value;
}

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { DICTIONARIES } from "./dictionaries";

/** Langue choisie par le visiteur (cookie), francais par defaut. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Dictionnaire de la langue courante, pour les Server Components et generateMetadata. */
export async function getDictionary() {
  return DICTIONARIES[await getLocale()];
}

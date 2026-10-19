import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { type Locale, isLocale } from "./config";
import type { Messages } from "./messages";

/**
 * Chargement des messages cote serveur (guide i18n de Next.js) : seul le
 * dictionnaire de la langue demandee est charge, puis transmis au client par
 * le layout racine. La langue vient du segment racine app/[lang], lu avec
 * next/root-params : aucun appel n'a besoin de la recevoir en parametre.
 */
const dictionaries: Record<Locale, () => Promise<Messages>> = {
  fr: () => import("./messages/fr.json").then((module) => module.default),
  en: () => import("./messages/en.json").then((module) => module.default),
  ar: () => import("./messages/ar.json").then((module) => module.default),
  zh: () => import("./messages/zh.json").then((module) => module.default),
};

/** Langue de la requete courante ; une langue inconnue donne une 404. */
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(): Promise<Messages> {
  return dictionaries[await getLocale()]();
}

/**
 * generateMetadata d'une page dont le titre ne depend que de la langue :
 * « {titre traduit} – Pattes Douces » (RGAA 8.6).
 */
export function pageTitle(key: keyof Messages["titles"]) {
  return async () => ({ title: (await getDictionary()).titles[key] });
}

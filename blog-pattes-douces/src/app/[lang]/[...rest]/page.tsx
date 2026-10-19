import { notFound } from "next/navigation";

/**
 * Toute URL inconnue sous /{langue} affiche la 404 du shell (not-found.tsx),
 * dans la bonne langue : le layout racine etant sous app/[lang], c'est le
 * moyen de composer une 404 coherente sans global-not-found.
 */
export default function CatchAllPage() {
  notFound();
}

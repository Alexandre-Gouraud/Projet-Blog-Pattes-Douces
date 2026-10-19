import type { Metadata } from "next";
import ArticleFeed from "@/features/articles/components/ArticleFeed";
import { getDictionary } from "@/i18n/dictionaries";

/**
 * Le gabarit « %s – Pattes Douces » du layout ne s'applique qu'aux segments
 * enfants : l'accueil, au meme niveau que le layout racine, donne son titre complet.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: { absolute: `${t.titles.feed} – Pattes Douces` } };
}

/** Accueil public : le fil d'actualite, dans le shell commun. */
export default function HomePage() {
  return <ArticleFeed />;
}

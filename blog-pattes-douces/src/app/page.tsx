import ArticleFeed from "@/features/articles/components/ArticleFeed";
import { pageTitle } from "@/i18n/server";

export const generateMetadata = pageTitle("feed");

/** Accueil public : le fil d'actualite, dans le shell commun. */
export default function HomePage() {
  return <ArticleFeed />;
}

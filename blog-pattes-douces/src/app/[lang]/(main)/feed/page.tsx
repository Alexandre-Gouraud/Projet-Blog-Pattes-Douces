import ArticleFeed from "@/features/articles/components/ArticleFeed";
import { pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("feed");

export default function FeedPage() {
  return <ArticleFeed />;
}

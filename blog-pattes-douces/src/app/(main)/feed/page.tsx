import ArticleFeed from "@/features/articles/components/ArticleFeed";
import { pageTitle } from "@/i18n/server";

export const generateMetadata = pageTitle("feed");

export default function FeedPage() {
  return <ArticleFeed />;
}

import type { Metadata } from "next";
import ArticleFeed from "@/features/articles/components/ArticleFeed";

export const metadata: Metadata = { title: "Fil d'actualité" };

export default function FeedPage() {
  return <ArticleFeed />;
}

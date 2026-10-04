import type { Metadata } from "next";
import MyArticlesList from "@/features/articles/components/MyArticlesList";

export const metadata: Metadata = { title: "Mes articles" };

export default function MyArticlesPage() {
  return <MyArticlesList />;
}

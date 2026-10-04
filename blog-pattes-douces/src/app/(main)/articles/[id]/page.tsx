import type { Metadata } from "next";
import ArticleDetail from "@/features/articles/components/ArticleDetail";

export const metadata: Metadata = { title: "Article" };

export default async function ArticlePage({ params }: PageProps<"/articles/[id]">) {
  const { id } = await params;
  return <ArticleDetail articleId={id} />;
}

import type { Metadata } from "next";
import ArticleForm from "@/features/articles/components/ArticleForm";

export const metadata: Metadata = { title: "Nouvel article" };

export default function NewArticlePage() {
  return <ArticleForm />;
}

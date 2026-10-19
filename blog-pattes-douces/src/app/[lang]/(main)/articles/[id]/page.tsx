import type { Metadata } from "next";
import ArticleDetail from "@/features/articles/components/ArticleDetail";
import { getDictionary } from "@/i18n/dictionaries";
import { prisma } from "@/lib/prisma";
import { isObjectId } from "@/lib/validation";

/** Le titre du document reprend celui de l'article (RGAA 8.6). */
export async function generateMetadata({ params }: PageProps<"/[lang]/articles/[id]">): Promise<Metadata> {
  const { id } = await params;
  const article = isObjectId(id)
    ? await prisma.article.findUnique({ where: { id }, select: { titre: true } }).catch(() => null)
    : null;
  return { title: article?.titre ?? (await getDictionary()).titles.article };
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/articles/[id]">) {
  const { id } = await params;
  return <ArticleDetail articleId={id} />;
}

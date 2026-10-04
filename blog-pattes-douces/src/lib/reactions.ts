import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, readJson } from "@/lib/http";
import { isObjectId } from "@/lib/validation";

/**
 * Bascule la reaction d'un utilisateur sur un article : l'ajoute si elle est
 * absente, la retire sinon. `reaction1` = like, `reaction2` = dislike.
 * Partage par /api/articles/[id]/like et /api/articles/[id]/dislike.
 */
export async function toggleReaction(
  request: Request,
  articleId: string,
  field: "reaction1" | "reaction2"
) {
  try {
    const body = await readJson(request);
    const userId = body?.userId;

    if (!isObjectId(articleId) || !isObjectId(userId)) {
      return badRequest("Identifiant invalide");
    }

    const [article, user] = await Promise.all([
      prisma.article.findUnique({ where: { id: articleId }, select: { reaction1: true, reaction2: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    ]);

    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const reactions = article[field];
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        [field]: reactions.includes(userId)
          ? { set: reactions.filter((id) => id !== userId) }
          : { push: userId },
      },
    });

    return NextResponse.json(updatedArticle, { status: 200 });
  } catch (error) {
    console.error("Erreur :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

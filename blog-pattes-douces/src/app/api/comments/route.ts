import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma, publicUserSelect } from "@/lib/prisma";
import { badRequest, readJson } from "@/lib/http";
import { LIMITS, isObjectId, isText } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");
  // Commentaires ecrits par cet utilisateur (pages Commentaires et Activite).
  const commenterId = searchParams.get("commenterId");
  // Commentaires recus sur les articles de cet utilisateur (statistiques).
  const authorId = searchParams.get("authorId");

  if ([articleId, commenterId, authorId].some((id) => id && !isObjectId(id))) {
    return badRequest("Identifiant invalide");
  }

  // Ignore les commentaires orphelins (article ou auteur supprime ou inexistant) :
  // un seul d'entre eux faisait echouer toute la requete.
  const where: Prisma.CommentaireWhereInput = {
    article_source: { is: authorId ? { auteurId: authorId } : {} },
    commentataire: { is: {} },
  };
  if (articleId) where.article_sourceId = articleId;
  if (commenterId) where.commentataireId = commenterId;

  try {
    const commentaires = await prisma.commentaire.findMany({
      where,
      orderBy: { date: "desc" },
      select: {
        id: true,
        article_source: { select: { id: true, titre: true } }, // Assurez-vous que ce champ correspond à votre schéma Prisma
        commentataire: { select: publicUserSelect },
        date: true,
        texte: true,
        reaction1: true,
        reaction2: true,
      },
    });

    return NextResponse.json(commentaires, { status: 200 });
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des commentaires" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const id_article = body?.id_article;
    const texte = body?.texte;
    const commentataireId = body?.commentataireId;

    if (!isObjectId(id_article) || !isObjectId(commentataireId) || !isText(texte, LIMITS.commentaire)) {
      return NextResponse.json(
        { error: `Les champs id_article, texte (${LIMITS.commentaire} caractères max) et commentataireId sont obligatoires.` },
        { status: 400 }
      );
    }

    // Un commentaire sur un article ou par un utilisateur inexistant deviendrait orphelin.
    const [article, commentataire] = await Promise.all([
      prisma.article.findUnique({ where: { id: id_article }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: commentataireId }, select: { id: true } }),
    ]);
    if (!article || !commentataire) {
      return NextResponse.json({ error: "Article ou utilisateur introuvable" }, { status: 404 });
    }

    const commentaire = await prisma.commentaire.create({
      data: {
        article_sourceId: id_article,
        texte: texte.trim(),
        commentataireId,
        reaction1: [], // Initialise avec un tableau vide
        reaction2: [], // Initialise avec un tableau vide
        date: new Date(),
      },
    });

    return NextResponse.json(commentaire, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du commentaire :", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du commentaire" },
      { status: 500 }
    );
  }
}

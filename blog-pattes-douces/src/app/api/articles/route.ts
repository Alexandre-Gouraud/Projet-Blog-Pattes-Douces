import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma, publicUserSelect } from "@/lib/prisma";
import { badRequest, readJson } from "@/lib/http";
import { LIMITS, isBlobImageUrl, isObjectId, isText } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get("authorId");
  // Articles likes ou dislikes par cet utilisateur (page Activite).
  const reactedBy = searchParams.get("reactedBy");

  if ((authorId && !isObjectId(authorId)) || (reactedBy && !isObjectId(reactedBy))) {
    return badRequest("Identifiant invalide");
  }

  const where: Prisma.ArticleWhereInput = {};
  if (authorId) where.auteurId = authorId;
  if (reactedBy) where.OR = [{ reaction1: { has: reactedBy } }, { reaction2: { has: reactedBy } }];

  try {
    const articles = await prisma.article.findMany({
      where,
      include: { auteur: { select: publicUserSelect } },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(articles, { status: 200 });
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des articles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Parse request JSON
    const body = await readJson(request);
    const titre = body?.titre;
    const texte = body?.texte;
    const userId = body?.userId;
    const imageUrl = body?.imageUrl || undefined;

    // Validate input
    if (!isText(titre, LIMITS.titre) || !isText(texte, LIMITS.texte)) {
      return badRequest(`Titre (${LIMITS.titre} caractères max) et texte (${LIMITS.texte} max) obligatoires`);
    }
    if (!isObjectId(userId)) {
      return badRequest("Données manquantes");
    }
    // Seules les images televersees via /api/uploads sont acceptees.
    if (imageUrl !== undefined && !isBlobImageUrl(imageUrl)) {
      return badRequest("Image invalide");
    }

    const author = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!author) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Create article in database
    await prisma.article.create({
      data: {
        titre: titre.trim(),
        texte: texte.trim(),
        image: imageUrl,
        vue: [],
        reaction1: [],
        reaction2: [],
        auteur: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json({ message: "Article créé avec succès" }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

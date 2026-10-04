import { NextResponse } from "next/server";
import { prisma, publicUserSelect } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");

    const articles = await prisma.article.findMany({
      where: authorId ? { auteurId: authorId } : undefined,
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
    const { titre, texte, userId, imageUrl } = await request.json();

    // Validate input
    if (!titre || !texte || !userId) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Create article in database
    await prisma.article.create({
      data: {
        titre,
        texte,
        image: imageUrl,
        vue: [],
        reaction1: [],
        reaction2: [],
        auteur: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json({ message: "Article créé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

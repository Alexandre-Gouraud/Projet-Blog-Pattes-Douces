import { NextResponse } from "next/server";
import { prisma, publicUserSelect } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    const commentaires = await prisma.commentaire.findMany({
      where: articleId ? { article_sourceId: articleId } : undefined,
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
    const body = await req.json();
    const { id_article, texte, commentataireId } = body;

    if (!id_article || !texte || !commentataireId) {
      return NextResponse.json(
        { error: "Les champs id_article, texte et commentataireId sont obligatoires." },
        { status: 400 }
      );
    }

    const commentaire = await prisma.commentaire.create({
      data: {
        article_sourceId: id_article,
        texte,
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

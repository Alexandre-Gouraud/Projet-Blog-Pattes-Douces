import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const commentaires = await prisma.commentaire.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        article_source: true, // Assurez-vous que ce champ correspond à votre schéma Prisma
        commentataire: true,
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

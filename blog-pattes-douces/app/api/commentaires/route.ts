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

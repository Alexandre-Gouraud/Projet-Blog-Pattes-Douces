import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handle POST requests to create a new commentaire
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_user, id_article, texte } = body;

    const commentaire = await prisma.commentaire.create({
      data: {
      commentataireId: id_user, // Updated to match the schema
      article_sourceId: id_article, // Updated to match the schema
      texte,
      date: new Date(),
      },
    });

    return NextResponse.json(commentaire, { status: 201 });
  } catch (error) {
    console.error("Error creating commentaire:", error);
    return NextResponse.json({ error: "Erreur lors de la création du commentaire" }, { status: 500 });
  }
}

// Handle GET requests to fetch all commentaires
export async function GET() {
  try {
    const commentaire = await prisma.commentaire.findMany();
    return NextResponse.json(commentaire, { status: 200 });
  } catch (error) {
    console.error("Error fetching commentaires:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des commentaires" }, { status: 500 });
  }
}

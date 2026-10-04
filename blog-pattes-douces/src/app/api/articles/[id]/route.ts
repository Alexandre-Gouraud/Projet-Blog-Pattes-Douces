import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: RouteContext<"/api/articles/[id]">) {
  const { id } = await params;

  try {
    const article = await prisma.article.findUnique({
      where: { id: id },
      select: {
        id: true,
        auteurId: true,
        titre: true,
        texte: true,
        image: true,
        date: true,
        vue: true,
        reaction1: true,
        reaction2: true,
        auteur: {
          select: {
            id: true,
            pseudo: true,
          },
        },
        commentaires: {
          select: {
            id: true,
            texte: true,
            date: true,
            reaction1: true,
            reaction2: true,
            commentataire: {
              select: {
                id: true,
                pseudo: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article :", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'article" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext<"/api/articles/[id]">) {
  try {
    const { id } = await params;

    await prisma.commentaire.deleteMany({
      where: { article_sourceId: id },
    });

    await prisma.article.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article :", error);
    return NextResponse.json({ success: false, error: "Failed to delete article" }, { status: 500 });
  }
}

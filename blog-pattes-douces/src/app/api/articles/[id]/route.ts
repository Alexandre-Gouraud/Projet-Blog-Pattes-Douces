import { NextResponse } from "next/server";
import { prisma, publicUserSelect } from "@/lib/prisma";
import { badRequest } from "@/lib/http";
import { isObjectId } from "@/lib/validation";

export async function GET(request: Request, { params }: RouteContext<"/api/articles/[id]">) {
  const { id } = await params;
  // Un id mal forme ne peut designer aucun article (et ferait planter Prisma).
  if (!isObjectId(id)) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
  }

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
          select: publicUserSelect,
        },
        commentaires: {
          select: {
            id: true,
            texte: true,
            date: true,
            reaction1: true,
            reaction2: true,
            commentataire: {
              select: publicUserSelect,
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
    if (!isObjectId(id)) {
      return badRequest("Identifiant invalide");
    }

    // Transaction : les commentaires ne sont pas supprimes si l'article ne l'est pas.
    const [, deleted] = await prisma.$transaction([
      prisma.commentaire.deleteMany({
        where: { article_sourceId: id },
      }),
      prisma.article.deleteMany({ where: { id } }),
    ]);

    if (deleted.count === 0) {
      return NextResponse.json({ success: false, error: "Article non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article :", error);
    return NextResponse.json({ success: false, error: "Failed to delete article" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma, publicUserSelect } from "@/lib/prisma";
import { badRequest } from "@/lib/http";
import { isObjectId } from "@/lib/validation";

export async function GET(req: Request, { params }: RouteContext<"/api/users/[id]">) {
  try {
    const { id } = await params;
    if (!isObjectId(id)) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { ...publicUserSelect, biographie: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération de l'utilisateur" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteContext<"/api/users/[id]">) {
  try {
    const { id } = await params;

    if (!isObjectId(id)) {
      return badRequest("ID utilisateur manquant");
    }

    const articleIds = (
      await prisma.article.findMany({ where: { auteurId: id }, select: { id: true } })
    ).map((article) => article.id);

    // Ordre impose par les relations : d'abord les commentaires (ceux de
    // l'utilisateur ET ceux recus sur ses articles, sinon la suppression des
    // articles echoue), puis les articles, puis le compte. En transaction pour
    // ne jamais laisser un compte a moitie supprime.
    const [, , deleted] = await prisma.$transaction([
      prisma.commentaire.deleteMany({
        where: { OR: [{ commentataireId: id }, { article_sourceId: { in: articleIds } }] },
      }),
      prisma.article.deleteMany({
        where: { auteurId: id },
      }),
      prisma.user.deleteMany({
        where: { id },
      }),
    ]);

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Compte supprimé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du compte" }, { status: 500 });
  }
}

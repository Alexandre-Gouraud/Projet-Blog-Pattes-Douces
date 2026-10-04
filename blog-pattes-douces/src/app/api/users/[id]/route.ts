import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: RouteContext<"/api/users/[id]">) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!id) {
      return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    await prisma.article.deleteMany({
      where: { auteurId: id },
    });

    await prisma.commentaire.deleteMany({
      where: { commentataireId: id },
    });

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Compte supprimé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du compte" }, { status: 500 });
  }
}

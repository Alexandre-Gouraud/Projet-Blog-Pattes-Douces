import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    console.log("ID reçu :", id);
    

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

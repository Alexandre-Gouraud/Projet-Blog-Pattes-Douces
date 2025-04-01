import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const commentaires = await prisma.commentaires.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        id_article: true,
        id_user: true,
        date: true,
        texte: true,
        reaction1: true,
        reaction2: true,
      },
    });

    res.status(200).json(commentaires);
  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des commentaires" });
  }
}

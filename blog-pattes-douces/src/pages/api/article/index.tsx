import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const articles = await prisma.article.findMany({
      orderBy: { date: "desc" },
    });

    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des articles" });
  }
}

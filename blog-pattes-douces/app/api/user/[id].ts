import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const { id } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: id as string },
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
}

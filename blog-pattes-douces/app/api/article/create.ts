// import { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

//   try {
//     const { id_user, titre, texte, image } = req.body;

//     const article = await prisma.article.create({
//       data: {
//         id_user,
//         titre,
//         texte,
//         image,
//         date: new Date(),
//         vue: [],
//         reaction1: [],
//         reaction2: [],
//         commentaires: [],
//       },
//     });

//     res.status(201).json(article);
//   } catch (error) {
//     res.status(500).json({ error: "Erreur lors de la création de l'article" });
//   }
// }

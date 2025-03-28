// import { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

//   try {
//     const { pseudo, email, password, biographie } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await prisma.user.create({
//       data: {
//         pseudo,
//         email,
//         password: hashedPassword,
//         biographie,
//       },
//     });

//     res.status(201).json(user);
//   } catch (error) {
//     res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
//   }
// }

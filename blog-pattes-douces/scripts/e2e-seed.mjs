/**
 * Donnees minimales pour les tests e2e (CI) : un auteur et un article, afin que
 * le fil et la page d'article aient du contenu a analyser. Idempotent : relancer
 * le script ne cree rien de plus.
 *
 *   DATABASE_URL=... node scripts/e2e-seed.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PSEUDO = "e2e-auteur";
const TITRE = "Premiers pas avec un chaton";

try {
  const auteur = await prisma.user.upsert({
    where: { pseudo: PSEUDO },
    update: {},
    create: {
      pseudo: PSEUDO,
      email: "e2e-auteur@example.test",
      espece: "cat",
      biographie: "Compte de test pour les tests e2e.",
      password: await bcrypt.hash("Pattes-Douces-1!", 10),
    },
  });
  const existing = await prisma.article.findFirst({ where: { titre: TITRE, auteurId: auteur.id } });
  if (!existing) {
    await prisma.article.create({
      data: {
        titre: TITRE,
        texte: "Un chaton a besoin de calme, de jeux et de repas reguliers.\n\nPrevoyez un coin tranquille pour ses premiers jours.",
        langue: "fr",
        auteurId: auteur.id,
      },
    });
  }
  console.log("Seed e2e termine.");
} finally {
  await prisma.$disconnect();
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Création d'un utilisateur
  const user = await prisma.user.create({
    data: {
      pseudo: "JohnDoe",
      email: "johndoe@example.com",
      password: "securepassword",
      biographie: "Développeur passionné",
    },
  });

  console.log("Utilisateur créé :", user);

  // Création d'un article lié à cet utilisateur
  const article = await prisma.article.create({
    data: {
      authorId: user.id,
      post: {
        id_post: "1",
        title: "Mon premier article",
        text: "Ceci est le contenu de l'article.",
        image: "https://example.com/image.jpg",
        date: new Date(),
        views: [],
        reactions: [],
        comments: {},
      },
    },
  });

  console.log("Article créé :", article);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

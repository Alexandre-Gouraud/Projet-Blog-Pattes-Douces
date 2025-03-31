import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function GET(request: Request) {
    if (request.method !== "GET") return new Response(JSON.stringify({ error: "Méthode non autorisée" }), { status: 405 });

    try {
      const id_user = request.headers.get("id_user"); // Assumes user ID is passed in headers
      if (!id_user) {
        return new Response(JSON.stringify({ error: "Utilisateur non authentifié" }), { status: 401 });
      }

      const articles = await prisma.article.findMany({
        where: { id_user: id_user },
        orderBy: { date: "desc" },
        select: {
          id: true,
          titre: true,
          date: true,
          vue: true,
          reaction1: true,
          reaction2: true,
        },
      });
  
      return new Response(JSON.stringify(articles), { status: 200 });
    } catch (error) {
      console.error("Erreur API:", error);
      return new Response(JSON.stringify({ error: "Erreur lors de la récupération des articles" }), { status: 500 });
    }
  }

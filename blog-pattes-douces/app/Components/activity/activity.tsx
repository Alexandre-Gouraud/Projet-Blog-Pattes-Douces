"use client";
import { PrismaClient } from "@prisma/client";
import { useEffect, useState } from "react";

type Article = {
  id: string;
  titre: string;
  texte: string;
  image?: string;
  date: string;
  userId: string; // Assure-toi que l'API retourne un userId
};

export default function Activity({ userId }: { userId: string }) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/article");
        const data: Article[] = await response.json();

        // Filtrer les articles pour ne garder que ceux de l'utilisateur
        const userArticles = data.filter(article => article.userId === userId);
        setArticles(userArticles);
      } catch (error) {
        console.error("Erreur lors de la récupération des articles:", error);
      }
    };

    fetchArticles();
  }, [userId]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Mes articles</h1>
      <div className="space-y-6">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="border p-4 rounded-lg shadow-md bg-white">
              <h2 className="text-xl font-semibold">{article.titre}</h2>
              <p className="text-gray-700">{article.texte}</p>
              {article.image && <img src={article.image} alt={article.titre} className="mt-2 rounded-md" />}
              <p className="text-sm text-gray-500">Publié le {new Date(article.date).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucun article trouvé pour cet utilisateur.</p>
        )}
      </div>
    </div>
  );
}

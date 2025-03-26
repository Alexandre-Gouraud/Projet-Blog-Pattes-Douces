"use client";
import { PrismaClient } from "@prisma/client";
import { useEffect, useState } from "react";

type Article = {
  id: string;
  titre: string;
  texte: string;
  image?: string;
  date: string;
};

export default function Feedhome() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await fetch("/api/article");
      const data = await response.json();
      setArticles(data);
    };
    fetchArticles();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Articles récents</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{article.titre}</h2>
            <p className="text-gray-700">{article.texte}</p>
            {article.image && <img src={article.image} alt={article.titre} className="mt-2 rounded-md" />}
            <p className="text-sm text-gray-500">Publié le {new Date(article.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

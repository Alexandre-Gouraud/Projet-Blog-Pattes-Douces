"use client";
import { useEffect, useState } from "react";

type Article = {
  id: string;
  titre: string;
  texte: string;
  image?: string;
  date: string;
  vue: any[]; // Typage plus clair
  reaction1: any[];
  reaction2: any[];
};

export default function Feedhome() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/article");
        if (!response.ok) throw new Error("Erreur lors du chargement des articles");
        
        const data: Article[] = await response.json();
        setArticles(data);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchArticles();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Articles récents</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-semibold">{article.titre}</h2>
            <p className="text-gray-700">{article.texte}</p>
            {article.image && (
              <img
                src={article.image}
                alt={article.titre}
                className="mt-2 rounded-md"
              />
            )}
            <p className="text-sm text-gray-500">
              Publié le {new Date(article.date).toLocaleDateString()}
            </p>
            
            <div className="flex space-x-4">
              <p className="text-sm text-green-400">Vues : {article.vue.length}</p>
              <p className="text-sm text-blue-400">Like : {article.reaction1.length}</p>
              <p className="text-sm text-red-400">Dislike : {article.reaction2.length}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

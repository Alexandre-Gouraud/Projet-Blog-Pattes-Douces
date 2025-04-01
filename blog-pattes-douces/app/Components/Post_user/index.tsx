import React from "react";
import { useEffect, useState } from "react";


type Article = {
  id: string;
  id_user: string;
  titre: string;
  texte: string;
  image?: string;
  date: string;
};

type User = {
  id: string;
  pseudo: string;
};


export default function Posts() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await fetch("/api/article");
      const data = await response.json();
      setArticles(data);
    };
    fetchArticles();
  }, []);

  const [pseudo, setPseudo] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPseudo = localStorage.getItem("pseudo");
      setPseudo(storedPseudo);
    }
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Articles récents</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{pseudo}</h2>
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

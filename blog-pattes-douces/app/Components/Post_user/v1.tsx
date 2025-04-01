import React, { useEffect, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [pseudoLoaded, setPseudoLoaded] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await fetch("/api/article");
      const data = await response.json();
      setArticles(data);
      setIsLoading(false);
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPseudo = localStorage.getItem("pseudo");
      setPseudo(storedPseudo);
      setPseudoLoaded(true);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Articles récents</h1>
      {isLoading || !pseudoLoaded ? (
        <div className="mx-auto w-full max-w-sm rounded-md border border-blue-300 p-4">
          <div className="flex animate-pulse space-x-4">
            <div className="size-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 rounded bg-gray-200"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 h-2 rounded bg-gray-200"></div>
                  <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                </div>
                <div className="h-2 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HandThumbUpIcon, HandThumbDownIcon, EyeIcon } from "@heroicons/react/24/solid";
import { addView, fetchArticles } from "@/lib/api-client";
import { getUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import type { Article } from "@/types";

export default function ArticleFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setArticles(await fetchArticles());
        setIsLoaded(true);
      } catch (error) {
        console.error("Erreur lors du chargement des articles :", error);
      }
    };

    loadArticles();
  }, []);

  const handleAddView = async (id: string) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      await addView(id, userId);

      // Met à jour localement pour éviter un rechargement
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === id
            ? { ...article, vue: [...article.vue, userId!] }
            : article
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout de la vue :", error);
    }
  };

  if (!isLoaded) {    // Afficher l'animation de chargement si les données ne sont pas chargées
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Chargement des articles...</h1>
            <div className="space-y-6">
                {/* Affiche plusieurs blocs de chargement */}
                {[...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse bg-white p-4 rounded-md shadow-md"
                    >
                        <div className="mb-4 h-4 w-1/3 bg-gray-300 rounded"></div>
                        <div className="h-6 w-1/2 bg-gray-300 rounded mb-4"></div>
                        <div className="h-24 w-full bg-gray-200 rounded"></div>
                        <div className="mt-4 flex space-x-4">
                            <div className="h-4 w-12 bg-gray-300 rounded"></div>
                            <div className="h-4 w-12 bg-gray-300 rounded"></div>
                            <div className="h-4 w-12 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Articles récents</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={ROUTES.article(article.id)}
            onClick={() => handleAddView(article.id)}
            className="block bg-white p-4 rounded-md shadow-md cursor-pointer transition-transform transform hover:scale-105"
          >
            <h2 className="text-xl font-semibold">{article.auteur?.pseudo || "Inconnu"}</h2>
            <h2 className="text-xl font-semibold">{article.titre}</h2>
            <p className="text-gray-700">{article.texte}</p>
            {/* Uncomment the image if needed */}
            {/* {article.image && <img src={article.image} alt={article.titre} className="mt-2 rounded-md" />} */}
            <p className="text-sm text-gray-500">Publié le {new Date(article.date).toLocaleDateString()}</p>
            <div className="flex space-x-4 mt-2">
              <p className="text-sm text-gray-400">
                <EyeIcon className="h-5 w-5 inline-block" /> {article.vue.length}
              </p>
              <p className="text-sm text-blue-400">
                <HandThumbUpIcon className="h-5 w-5 inline-block" /> {article.reaction1.length}
              </p>
              <p className="text-sm text-red-400">
                <HandThumbDownIcon className="h-5 w-5 inline-block" /> {article.reaction2.length}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

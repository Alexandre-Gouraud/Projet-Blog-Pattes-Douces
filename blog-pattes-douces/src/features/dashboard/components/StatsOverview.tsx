"use client";

import { useEffect, useState } from "react";
import { fetchArticles, fetchComments } from "@/lib/api-client";
import { getPseudo, getUserId } from "@/lib/auth/session";
import type { Article, Comment } from "@/types";

export default function Post_user() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [commentaires, setCommentaires] = useState<Comment[]>([]);
  const pseudo = getPseudo();
  const userId = getUserId();

  useEffect(() => {
    const loadStats = async (): Promise<void> => {
      try {
        const data = await fetchArticles();
        setArticles(data.filter((article) => article.auteurId === userId));

        const commentairesData = await fetchComments();
        // NOTE: lit volontairement l'etat `articles` (vide au premier rendu),
        // comportement conserve a l'identique lors de la restructuration.
        const userArticleIds = articles.map((article) => article.id);
        setCommentaires(
          commentairesData.filter((comment) => userArticleIds.includes(comment.article_source.id))
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadStats();
  }, [userId]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Vos Statistiques récentes</h1>

      {/* Aligner les blocs côte à côte */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="flex-1 min-w-[200px] border p-4 rounded-lg shadow-md bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-indigo-300 opacity-100 hover:opacity-60%">
          <h2 className="text-xl font-semibold">Total d'articles</h2>
          <p className="text-gray-500">{articles.length} Articles Publiés</p>
        </div>

        <div className="flex-1 min-w-[200px] border p-4 rounded-lg shadow-md bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-green-300 opacity-100 hover:opacity-60%">
          <h2 className="text-xl font-semibold">Total de Vues</h2>
          <p className="text-gray-500">
            {articles.reduce((total, article) => total + article.vue.length, 0)} Vues
          </p>
        </div>

        <div className="flex-1 min-w-[200px] border p-4 rounded-lg shadow-md bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-orange-300 opacity-100 hover:opacity-60%">
          <h2 className="text-xl font-semibold">Total de Réactions</h2>
          <p className="text-gray-500">
            {articles.reduce((total, article) => total + article.reaction1.length + article.reaction2.length,0)}{" "}Réactions
          </p>
        </div>

        <div className="flex-1 min-w-[200px] border p-4 rounded-lg shadow-md bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-red-300 opacity-100 hover:opacity-60%">
          <h2 className="text-xl font-semibold">Total de Commentaires</h2>
          <p className="text-gray-500">
            {commentaires.length} Commentaires
          </p>
        </div>
      </div>

      {/* Bloc complémentaire */}
      <div className="border p-4 rounded-lg shadow-md bg-white transform transition-all duration-300 hover:scale-102 hover:shadow-xl hover:bg-orange-300">
        <h1 className="text-3xl font-bold mb-4">Toutes vos statistiques</h1>
        <h2 className="text-xl font-semibold">{pseudo}</h2>
        <div className="flex space-x-4">
          <p className="text-sm text-gray-400">
            Vues :{" "}
            {articles.reduce((total, article) => total + article.vue.length, 0)}
          </p>
          <p className="text-sm text-blue-400">
            Like :{" "}
            {articles.reduce((total, article) => total + article.reaction1.length, 0)}
          </p>
          <p className="text-sm text-red-400">
            Dislike :{" "}
            {articles.reduce((total, article) => total + article.reaction2.length, 0)}
          </p>
          <p className="text-sm text-purple-400">
            Réactions :{" "}
            {articles.reduce(
              (total, article) => total + article.reaction1.length + article.reaction2.length,0)}
          </p>
        </div>
      </div>
    </div>
  );
}

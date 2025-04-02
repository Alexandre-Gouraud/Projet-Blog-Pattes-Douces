"use client";

import React, { useEffect, useState } from "react";

type Article = {
  id: string;
  titre: string;
  vue: number[];
  reaction1: number[];
  reaction2: number[];
};

type Commentaires = {
  id: string;
  texte?: string;
};

export default function Statistics() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaires[]>([]);

  const totalVues = articles.reduce((total, article) => total + article.vue.length, 0);
  const totalReactions =
    articles.reduce((total, article) => total + article.reaction1.length + article.reaction2.length, 0);
  const totalLikes = articles.reduce((total, article) => total + article.reaction1.length, 0);
  const totalDislikes = articles.reduce((total, article) => total + article.reaction2.length, 0);

  const totalInteractions = totalLikes + totalDislikes + totalReactions;
  const likesPercentage = (totalLikes / totalInteractions) * 100 || 0;
  const dislikesPercentage = (totalDislikes / totalInteractions) * 100 || 0;
  const reactionsPercentage = (totalReactions / totalInteractions) * 100 || 0;

  useEffect(() => {
    const dummyArticles = [
      { id: "1", titre: "Article 1", vue: [1, 2, 3], reaction1: [1, 2], reaction2: [] },
      { id: "2", titre: "Article 2", vue: [1, 2], reaction1: [2], reaction2: [1] },
    ];
    setArticles(dummyArticles);

    const dummyComments = [{ id: "1" }, { id: "2" }];
    setCommentaires(dummyComments);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Statistiques Visuelles</h1>

      {/* Container des graphiques */}
      <div className="flex space-x-8 justify-between">
        {/* Diagramme Circulaire */}
        <div className="w-1/2 bg-white border border-black shadow-md p-4 rounded-lg flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Répartition des Réactions</h2>
          <div
            className="relative w-64 h-64 rounded-full"
            style={{
              background: `conic-gradient(
                #4CAF50 ${likesPercentage}%,
                #F44336 ${likesPercentage}% ${likesPercentage + dislikesPercentage}%,
                #FF9800 ${likesPercentage + dislikesPercentage}% 100%
              )`,
            }}
          >
            <div className="absolute inset-12 bg-white rounded-full flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold">Total</h3>
              <p className="text-2xl font-bold text-gray-700">{totalInteractions}</p>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
              <span className="text-sm">Likes ({Math.round(likesPercentage)}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-red-500 rounded-full"></span>
              <span className="text-sm">Dislikes ({Math.round(dislikesPercentage)}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-orange-500 rounded-full"></span>
              <span className="text-sm">Réactions ({Math.round(reactionsPercentage)}%)</span>
            </div>
          </div>
        </div>

        {/* Diagramme à Barres */}
        <div className="w-1/2 bg-white border border-black shadow-md p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">Évolution par Statistiques</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-24 text-gray-600">Vues</span>
              <div className="w-full bg-gray-200 h-6 rounded">
                <div
                  className="bg-blue-500 h-6 rounded"
                  style={{
                    width: `${(totalVues / (totalVues + totalReactions)) * 100}%`,
                    maxWidth: "100%",
                  }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{totalVues}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-600">Likes</span>
              <div className="w-full bg-gray-200 h-6 rounded">
                <div
                  className="bg-green-500 h-6 rounded"
                  style={{ width: `${likesPercentage}%`, maxWidth: "100%" }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{totalLikes}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-600">Dislikes</span>
              <div className="w-full bg-gray-200 h-6 rounded">
                <div
                  className="bg-red-500 h-6 rounded"
                  style={{ width: `${dislikesPercentage}%`, maxWidth: "100%" }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{totalDislikes}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-gray-600">Réactions</span>
              <div className="w-full bg-gray-200 h-6 rounded">
                <div
                  className="bg-purple-500 h-6 rounded"
                  style={{
                    width: `${(totalReactions / (totalVues + totalReactions)) * 100}%`,
                    maxWidth: "100%",
                  }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{totalReactions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

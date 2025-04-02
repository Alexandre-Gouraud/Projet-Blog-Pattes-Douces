"use client";

import { useEffect, useState } from "react";

type Article = {
  id: string;
  auteurId: string;
  titre: string;
  texte: string;
  image?: string;
  date: string;
  vue: any[];
  reaction1: any[];
  reaction2: any[];
};

type Commentaires = {
  id: string; // Identifiant unique du commentaire
  texte: string; // Contenu du commentaire
  date: string; // Date de création du commentaire
  reaction1: string[]; // Liste des utilisateurs ayant réagi avec "reaction1"
  reaction2: string[]; // Liste des utilisateurs ayant réagi avec "reaction2"
  article_source: {
    id: string; // Identifiant de l'article
    titre: string; // Titre de l'article
    texte: string; // Contenu de l'article
    image?: string; // Image associée à l'article
    date: string; // Date de création de l'article
    vue: string[]; // Liste des utilisateurs ayant vu l'article
    reaction1: string[]; // Liste des utilisateurs ayant réagi avec "reaction1"
    reaction2: string[]; // Liste des utilisateurs ayant réagi avec "reaction2"
    auteurId: string; // Identifiant de l'auteur de l'article
  };
  commentataire: {
    id: string; // Identifiant de l'utilisateur ayant écrit le commentaire
    pseudo: string; // Pseudo de l'utilisateur
    biographie?: string; // Biographie de l'utilisateur
    email: string; // Email de l'utilisateur
    password: string; // Mot de passe hashé de l'utilisateur
  };
};

export default function Post_user() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaires[]>([]);
  const pseudo = typeof window !== "undefined" ? localStorage.getItem("pseudo") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    const fetchArticles = async (): Promise<void> => {
      try {

        // Ajout de la vérification de l'utilisateur
        const response = await fetch("/api/article");
        if (!response) throw new Error("Erreur lors du chargement de vos articles");

        // Vérification de la réponse de l'API
        const data: Article[] = await response.json();
        const userArticles = data.filter((article) => article.auteurId === userId);
        setArticles(userArticles);
        
        // Ajout des requetes API pour les commentaires

        const allCommentaires = await fetch("/api/commentaires");
        if (!allCommentaires.ok) throw new Error("Erreur API commentaires");

        const commentairesData: Commentaires[] = await allCommentaires.json();
        const userArticleIds = articles.map((article) => article.id);
        const filteredCommentaires = commentairesData.filter(
          (comment) => userArticleIds.includes(comment.article_source.id)
        );
        setCommentaires(filteredCommentaires);

      } catch (error) {
        console.error(error);
      }
    };

    fetchArticles();
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

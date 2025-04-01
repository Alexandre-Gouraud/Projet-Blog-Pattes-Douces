"use client";

import { useEffect, useState } from "react";

type Article = {
  id: string;
  titre: string;
  texte: string;
  image?: string;
  date: string;
  vue: string[];
  reaction1: string[];
  reaction2: string[];
  auteurId: string;
  auteur: {
    id: string;
    pseudo: string;
  };
};

export default function Dashboard() {
  const [auteurId, setAuteurId] = useState<string>("");
  const [articles, setArticles] = useState<Article[]>([]);

  const user_id = localStorage.getItem("user_id") || ""; // Récupérer l'ID de l'utilisateur connecté depuis le localStorage
  // Vérifier si l'utilisateur est connecté
  if (!user_id) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Vous n'êtes pas connecté</h1>
        <p className="text-gray-500">Veuillez vous connecter pour voir vos statistiques.</p>
      </div>
    );
  }
  // Récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const fetchAuteurId = async () => {
      try {
        const response = await fetch("/api/auteurId?user_id"); // 
        if (!response.ok) throw new Error("Erreur lors du chargement de l'auteur ID");
        
        const data = await response.json();
        setAuteurId(data.user_id);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAuteurId();
  }, []);

  // Récupérer uniquement les articles de cet utilisateur
  useEffect(() => {
    if (!auteurId) return; // Attendre que l'auteurId soit chargé

    const fetchArticles = async () => {
      try {
        const response = await fetch(`/api/article?authorId=${auteurId}`);
        if (!response.ok) throw new Error("Erreur lors du chargement des articles");
        
        const data: Article[] = await response.json();
        setArticles(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArticles();
  }, [auteurId]); // Dépendance : recharge quand auteurId est défini

  // Calcul des statistiques
  // const totalArticles = articles.length;
  // const totalCommentaires = articles.vue.length; // Nombre total de commentaires
  // const totalVues = articles.reduce((acc, article) => acc + article.vue.length, 0);
  // const totalLikes = articles.reduce((acc, article) => acc + article.reaction1.length, 0);
  // const totalDislikes = articles.reduce((acc, article) => acc + article.reaction2.length, 0);
  // const totalReactions = totalLikes + totalDislikes;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Vos Statistiques récentes</h1>
      <div className="space-y-6">
      <div className="border p-4 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold">Total d'arcxticle</h2>
        <p className="text-gray-500">{/**totalArticles**/} Articles Publiés </p>
      </div>

      <div className="border p-4 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold">Total de Vues</h2>
        <p className="text-gray-500">{/**totalVues**/} Vues </p>
      </div>

      <div className="border p-4 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold">Total de Commentaires</h2>
        <p className="text-gray-500">{/**totalCommentaires**/} Commentaires Publiés </p>
      </div>

        <div className="border p-4 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold">ID Utilisateur : {auteurId}</h2>
          <div className="flex space-x-4">
            <p className="text-sm text-gray-400">Total de Vues : {/**totalVues**/}</p>
            <p className="text-sm text-blue-400">Total de Like : {/**totalLikes**/}</p>
            <p className="text-sm text-red-400">Total de Dislike : {/**totalDislikes**/}</p>
            <p className="text-sm text-green-400">Total de Réactions : {/**totalReactions**/}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
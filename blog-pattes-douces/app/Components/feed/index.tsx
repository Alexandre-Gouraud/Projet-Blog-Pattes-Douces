"use client";
import { useEffect, useState } from "react";

type Article = {
  id: string;
  auteur: User
  titre: string;
  texte: string;
  image?: string;
  date: string;
  vue: any[];
  reaction1: any[];
  reaction2: any[];
};

type User = {
  id: string;
  pseudo: string;
  email: string;
}

export default function Feedhome() {
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [commentText, setCommentText] = useState<string>(""); 
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null); 

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPseudo = localStorage.getItem("pseudo");
      setPseudo(storedPseudo);
    }
  }, []);

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

  const handleAddComment = async (articleId: string) => {
    if (!commentText.trim()) {
      alert("Le commentaire ne peut pas être vide.");
      return;
    }

    const userId = localStorage.getItem("user_id"); 
    if (!userId) {
      alert("Vous devez être connecté pour ajouter un commentaire.");
      return;
    }

    try {
      const response = await fetch("/api/commentaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_article: articleId, 
          texte: commentText,
          commentataireId: userId, 
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout du commentaire");

      alert("Commentaire ajouté avec succès !");
      setCommentText(""); 
      setSelectedArticleId(null); 
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire :", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Articles récents</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="block transform transition-transform duration-300 hover:scale-102 bg-white p-4 rounded-md shadow-md"
          >
            <h2 className="text-xl font-semibold">{article.auteur?.pseudo || "Inconnu"}</h2>
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
              <p className="text-sm text-gray-400">Vues : {article.vue.length}</p>
              <p className="text-sm text-blue-400">Like : {article.reaction1.length}</p>
              <p className="text-sm text-red-400">Dislike : {article.reaction2.length}</p>
            </div>

            <button
              onClick={() => setSelectedArticleId(article.id)}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              Ajouter un commentaire
            </button>

            {selectedArticleId === article.id && (
              <div className="mt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Écrivez votre commentaire ici..."
                  className="w-full p-2 border rounded-md"
                />
                <button
                  onClick={() => handleAddComment(article.id)}
                  className="mt-2 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
                >
                  Envoyer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

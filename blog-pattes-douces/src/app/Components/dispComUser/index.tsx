"use client";
import { useEffect, useState } from "react";

type Commentaires = {
  id: string;
  texte: string;
  date: string;
  reaction1: string[];
  reaction2: string[];
  article_source: {
    id: string;
    titre: string;
  };
  commentataire: {
    id: string;
    pseudo: string;
  };
};

export default function ComUser() {
  const [commentaires, setCommentaires] = useState<Commentaires[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommentaires = async () => {
      try {
        const userId = localStorage.getItem("user_id"); // Récupère l'ID de l'utilisateur connecté
        if (!userId) {
          console.error("Utilisateur non connecté");
          return;
        }

        const response = await fetch("/api/commentaires");
        if (!response.ok) throw new Error("Erreur lors de la récupération des commentaires");

        const data: Commentaires[] = await response.json();
        const userCommentaires = data.filter((comment) => comment.commentataire.id === userId); // Filtre les commentaires
        setCommentaires(userCommentaires);
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommentaires();
  }, []);

  if (loading) {
    return <p>Chargement des commentaires...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Mes Commentaires</h1>
      <div className="space-y-6">
        {commentaires.length > 0 ? (
          commentaires.map((comment) => (
            <div key={comment.id} className="border p-4 rounded-lg shadow-md bg-white">
              <p className="text-gray-800">{comment.texte}</p>
              <p className="text-sm text-gray-500">
                Publié par {comment.commentataire.pseudo} le {new Date(comment.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Article : {comment.article_source.titre}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Vous n'avez publié aucun commentaire.</p>
        )}
      </div>
    </div>
  );
}
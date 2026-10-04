"use client";
import { useEffect, useState } from "react";
import { fetchCommentsByCommenter } from "@/lib/api-client";
import { getUserId } from "@/lib/auth/session";
import type { Comment } from "@/types";

export default function CommentList() {
  const [commentaires, setCommentaires] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const userId = getUserId(); // Récupère l'ID de l'utilisateur connecté
        if (!userId) {
          console.error("Utilisateur non connecté");
          return;
        }

        // Filtre les commentaires de l'utilisateur (fait par l'API)
        setCommentaires(await fetchCommentsByCommenter(userId));
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
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
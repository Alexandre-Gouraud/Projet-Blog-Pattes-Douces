"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchArticles, fetchComments } from "@/lib/api-client";
import { getUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import type { Article, Comment } from "@/types";

export default function ActivityList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [commentaires, setCommentaires] = useState<Comment[]>([]);
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userId = getUserId() || "";

    const loadActivity = async () => {
      try {
        const articlesData = await fetchArticles();
        setArticles(articlesData.filter((article) => article.auteurId === userId));

        const commentsData = await fetchComments();
        setCommentaires(
          commentsData.filter((comment) => comment.commentataire.id === userId)
        );

        setLikedArticles(
          articlesData.filter(
            (article) =>
              article.reaction1.includes(userId) ||
              article.reaction2.includes(userId)
          )
        );
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    loadActivity();
  }, []);

  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      {/* Section Articles */}
      <div className="col-span-2">
        <h1 className="text-3xl font-bold mb-4">Mes articles</h1>
        <div className="space-y-6">
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg shadow-md bg-white"
              >
                <h2 className="text-xl font-semibold mb-2">{article.titre}</h2>
                <p className="text-gray-700">{article.texte}</p>
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.titre}
                    className="mt-4 rounded-md max-h-64 object-cover"
                  />
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Publié le {new Date(article.date).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Aucun article trouvé.</p>
          )}
        </div>
      </div>

      <div className="col-span-1 flex flex-col space-y-6">
        {/* Section Commentaires */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Mes Commentaires</h2>
          <div className="border p-4 rounded-lg shadow-md bg-white space-y-4">
            {commentaires.length > 0 ? (
              commentaires.slice(0, 5).map((comment) => (
                <div key={comment.id}>
                  <p className="text-gray-800">{comment.texte}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Publié le {new Date(comment.date).toLocaleDateString()}
                  </p>
                  <hr className="my-4 border-gray-300" />
                </div>
              ))
            ) : (
              <p className="text-gray-500">Aucun commentaire trouvé.</p>
            )}

            {commentaires.length > 5 && (
              <button
                onClick={() => router.push(ROUTES.comments)}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
              >
                Voir plus de commentaires
              </button>
            )}
          </div>
        </div>

        {/* Section Articles Likés */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Articles Likés</h2>
          <div className="border p-4 rounded-lg shadow-md bg-white space-y-4">
            {likedArticles.length > 0 ? (
              likedArticles.map((article, index) => (
                <div key={index} className="bg-white p-3 rounded-md shadow">
                  <h3 className="text-lg font-semibold">{article.titre}</h3>
                  <p className="text-gray-700">{article.texte}</p>
                  <p className="text-sm text-gray-500">
                    Publié le {new Date(article.date).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Aucun article liké trouvé.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
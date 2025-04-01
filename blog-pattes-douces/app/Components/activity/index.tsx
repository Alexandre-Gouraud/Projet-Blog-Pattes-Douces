"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Article = {
  _id: string;
  id_user: string;
  titre: string;
  texte: string;
  image?: string;
  date: string;
  vue: string[];
  reaction1: string[];
  reaction2: string[];
};

type Commentaires = {
  id: string;
  id_article: string;
  id_user: string;
  date: string;
  texte: string;
  reaction1: string[];
  reaction2: string[];
};

export default function Activity({ userId }: { userId: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaires[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return; // Vérifie que userId est défini

    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/article");
        if (!response.ok) throw new Error("Erreur API articles");

        const data: Article[] = await response.json();
        setArticles(data.filter(article => article.id_user === userId));

        const allCommentaires = await fetch("/api/commentaires");
        if (!allCommentaires.ok) throw new Error("Erreur API commentaires");

        const commentairesData: Commentaires[] = await allCommentaires.json();
        setCommentaires(commentairesData.filter(comment => comment.id_user === userId));
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchArticles();
  }, [userId]);

  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      {/* Section Articles */}
      <div className="col-span-2">
        <h1 className="text-3xl font-bold mb-4">Mes articles</h1>
        <div className="space-y-6">
          {articles.length > 0 ? (
            articles.map((article) => (
              <div key={article._id} className="border p-4 rounded-lg shadow-md bg-white">
                <h2 className="text-xl font-semibold">{article.titre}</h2>
                <p className="text-gray-700">{article.texte}</p>
                {article.image && <img src={article.image} alt={article.titre} className="mt-2 rounded-md" />}
                <p className="text-sm text-gray-500">Publié le {new Date(article.date).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Aucun article trouvé.</p>
          )}
        </div>
      </div>

      {/* Section Commentaires */}
      <div className="col-span-1 bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Mes Commentaires</h2>
        <div className="space-y-4">
          {commentaires.length > 0 ? (
            <>
              {commentaires.slice(0, 5).map((comment) => (
                <div key={comment.id} className="bg-white p-3 rounded-md shadow">
                  <p className="text-gray-800">{comment.texte}</p>
                  <p className="text-sm text-gray-500">Publié le {new Date(comment.date).toLocaleDateString()}</p>
                </div>
              ))}

              {commentaires.length > 5 && (
                <button
                  onClick={() => router.push("/commentaires")}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Voir plus de commentaires
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500">Aucun commentaire trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
}
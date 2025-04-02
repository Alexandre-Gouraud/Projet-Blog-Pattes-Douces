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
  auteurId: string;
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

export default function Activity({ userId }: { userId: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaires[]>([]);
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    userId = localStorage.getItem("user_id") || "";
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/article");
        if (!response.ok) throw new Error("Erreur API articles");

        const data: Article[] = await response.json();
        setArticles(data.filter((article) => article.auteurId === userId));

        const allCommentaires = await fetch("/api/commentaires");
        if (!allCommentaires.ok) throw new Error("Erreur API commentaires");

        const commentairesData: Commentaires[] = await allCommentaires.json();
        const filteredCommentaires = commentairesData.filter(
          (comment) => comment.commentataire.id === userId
        );
        setCommentaires(filteredCommentaires);

        const LikedArticles = await fetch("/api/article");
        if (!LikedArticles.ok) throw new Error("Erreur API articles");

        const likedData: Article[] = await LikedArticles.json();
        setLikedArticles(
          likedData.filter(
            (article) =>
              article.reaction1.includes(userId) ||
              article.reaction2.includes(userId)
          )
        );
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
                onClick={() => router.push("/commentaires")}
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
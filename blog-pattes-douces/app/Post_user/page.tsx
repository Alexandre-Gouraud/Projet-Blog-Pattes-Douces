"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "next-auth/providers/kakao";

type Article = {
    id: string;
    auteurId: string;
    titre: string;
    texte: string;
    image?: string;
    date: DateTime;
    vue: any[];
    reaction1: any[];
    reaction2: any[];
    
};



export default function Post_user() { // Composant pour afficher les articles d'un utilisateur
    const [articles, setArticles] = useState<Article[]>([]);
    const router = useRouter();
    const pseudo = typeof window !== "undefined" ? localStorage.getItem("pseudo") : null; // Récupération du pseudo depuis le localStorage
    const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null; // Récupération de l'id_user depuis le localStorage

    useEffect(() => { // Récupération des articles de l'utilisateur
        const fetchArticles = async (): Promise<void> => {
            try {
                const response = await fetch("/api/article");
                if (!response) throw new Error("Erreur lors du chargement de vos articles");

                const data: Article[] = await response.json();
                const userArticles = data.filter((article) => article.auteurId === userId); // Filtrer par id_user
                setArticles(userArticles);
            } catch (error) {
                console.error(error);
            }
        };

        fetchArticles();
    }, [userId]);

    async function supprimer_article(id_article: string) {
        try {
            
          const response = await fetch(`/api/articles_user/supprimer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id_article }),
          });
    
          if (!response.ok) throw new Error("Erreur lors de la suppression");
    
          // mise à jour de la liste et de la page
          setArticles(articles.filter((article) => article.id !== id_article));
          
          router.refresh(); 
        } catch (error) {
          console.error(error);
        }
      }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Voici vos derniers articles</h1>
            <div className="space-y-6">
                {articles.map((article) => (
                    <div key={article.id} className="border p-4 rounded-lg shadow-md bg-white">
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
                        type="button"
                        onClick={() => supprimer_article(article.id)}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                        Supprimer
                    </button>
                    </div>
                ))}
            </div>

            <a href="../Creation_article">
                <button type="button"
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >Créer un article</button>
            </a>

        </div>
    );
}

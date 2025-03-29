"use client";
import { useEffect, useState } from "react";

type Article = {
    id: string;
    id_user: string; // Ajout de l'id_user pour identifier l'auteur
    titre: string;
    texte: string;
    image?: string;
    date: string;
    vue: any[];
    reaction1: any[];
    reaction2: any[];
    
};

export default function Post_user() { // Composant pour afficher les articles d'un utilisateur
      const [pseudo, setPseudo] = useState<string | null>(null);
    
      useEffect(() => { // Récupération du pseudo depuis le localStorage
        if (typeof window !== "undefined") {
            const storedPseudo = localStorage.getItem("pseudo");
            setPseudo(storedPseudo);
        }
      }, []);

    const [id_user, setId_user] = useState<string | null>(null);
    const storedid_user = localStorage.getItem("id_user");
    const userId = "67e667f590014db66ca3fb27";  // ID_user mis manuellement pour le test mais il faut trouver un moyen de le récupérer dynamiquement

    useEffect(() => { // Récupération de l'id_user depuis le localStorage
        if (typeof window !== "undefined") {
            const storedid_user = localStorage.getItem("id_user");
            setId_user(storedid_user);
        }
    }
    , []);


    const [articles, setArticles] = useState<Article[]>([]); // État pour stocker les articles de l'utilisateur
    

    useEffect(() => { // Récupération des articles de l'utilisateur
        const fetchArticles = async () => {
            try {
                const response = await fetch("/api/article");
                if (!response) throw new Error("Erreur lors du chargement de vos articles");

                const data: Article[] = await response.json();
                const userArticles = data.filter((article) => article.id_user === userId); // Filtrer par id_user
                setArticles(userArticles);
            } catch (error) {
                console.error(error);
            }
        };

        fetchArticles();
    }, [storedid_user]);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Voici vos derniers articles</h1>
            <div className="space-y-6">
                {articles.map((article) => (
                    <div key={article.id} className="border p-4 rounded-lg shadow-md bg-white">
                        <h2 className="text-xl font-semibold">{pseudo}</h2>
                        <h2 className="text-xl font-semibold">{article.id_user}</h2>
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
                    </div>
                ))}
            </div>
        </div>
    );
}

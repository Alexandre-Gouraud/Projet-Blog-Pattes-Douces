"use client";

import React, { useState, useEffect } from "react";
import useRouter from "next/router";

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

export default function Post_user() {
    const [articles, setArticles] = useState<Article[]>([]);
    const pseudo = typeof window !== "undefined" ? localStorage.getItem("pseudo") : null;
    const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
    const [isLoaded, setIsLoaded] = useState(false); // État pour gérer l'affichage de l'animation

    useEffect(() => {
        const fetchArticles = async (): Promise<void> => {
            try {
                const response = await fetch("/api/article");
                if (!response.ok) throw new Error("Erreur lors du chargement de vos articles");

                const data: Article[] = await response.json();
                const userArticles = data.filter((article) => article.auteurId === userId);
                setArticles(userArticles);
                setIsLoaded(true); // Définir l'état sur true lorsque les données sont chargées
            } catch (error) {
                console.error(error);
            }
        };

        fetchArticles();
    }, []);

    if (!isLoaded) {
        // Afficher l'animation de chargement si les données ne sont pas chargées
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">Chargement des articles...</h1>
                <div className="space-y-6">
                    {/* Affiche plusieurs blocs de chargement */}
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse bg-white p-4 rounded-md shadow-md"
                        >
                            <div className="mb-4 h-4 w-1/3 bg-gray-300 rounded"></div>
                            <div className="h-6 w-1/2 bg-gray-300 rounded mb-4"></div>
                            <div className="h-24 w-full bg-gray-200 rounded"></div>
                            <div className="mt-4 flex space-x-4">
                                <div className="h-4 w-12 bg-gray-300 rounded"></div>
                                <div className="h-4 w-12 bg-gray-300 rounded"></div>
                                <div className="h-4 w-12 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Voici vos derniers articles</h1>
            <div className="space-y-6">
                {articles.map((article) => (
                    <a key={article.id} href={`/Article_page/${article.id}`} className="block">
                        <div className="border p-4 rounded-lg shadow-md bg-white transform transition-transform duration-300 hover:scale-102">
                            <h2 className="text-xl font-semibold">{pseudo}</h2>
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
                    </a>
                ))}
            </div>
        </div>
    );
}

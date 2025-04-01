"use client";

import React from "react";
import useRouter from "next/router";
import { useEffect, useState } from "react";

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

    useEffect(() => {
        const fetchArticles = async (): Promise<void> => {
            try {
                const response = await fetch("/api/article");
                if (!response.ok) throw new Error("Erreur lors du chargement de vos articles");

                const data: Article[] = await response.json();
                const userArticles = data.filter((article) => article.auteurId === userId);
                setArticles(userArticles);
            } catch (error) {
                console.error(error);
            }
        };

        fetchArticles();
    }, []); // Removed userId from dependency array

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Voici vos derniers articles</h1>
            <div className="space-y-6">
                {articles.map((article) => (
                    <a key={article.id} href={`/Article_page/${article.id}`} className="block">
                        <div className="border p-4 rounded-lg shadow-md bg-white transform transition-transform duration-300 hover:scale-105">
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

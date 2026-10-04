"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteArticle, fetchArticles } from "@/lib/api-client";
import { getUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import type { Article } from "@/types";

/**
 * Liste des articles de l'utilisateur connecte, avec suppression.
 * Unique implementation : remplace app/Post_user/page.tsx et
 * app/Components/Post_user/index.tsx, qui faisaient double emploi.
 */
export default function MyArticlesList() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userId = getUserId();

        const loadArticles = async (): Promise<void> => {
            try {
                const data = await fetchArticles();
                setArticles(data.filter((article) => article.auteurId === userId));
                setIsLoaded(true);
            } catch (error) {
                console.error(error);
            }
        };

        loadArticles();
    }, []);

    async function handleDelete(articleId: string) {
        try {
            await deleteArticle(articleId);
            // mise a jour de la liste et de la page
            setArticles((previous) => previous.filter((article) => article.id !== articleId));
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    }

    if (!isLoaded) {
        // Afficher l'animation de chargement si les données ne sont pas chargées
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">Chargement des articles...</h1>
                <div className="space-y-6">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse bg-white p-4 rounded-md shadow-md">
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
                    <div key={article.id}>
                        <Link href={ROUTES.article(article.id)} className="block">
                            <div className="border p-4 rounded-lg shadow-md bg-white transform transition-transform duration-300 hover:scale-102">
                                <h2 className="text-xl font-semibold">{article.titre}</h2>
                                <p className="text-gray-700">{article.texte}</p>
                                <p className="text-sm text-gray-500">
                                    Publié le {new Date(article.date).toLocaleDateString()}
                                </p>

                                <div className="flex space-x-4">
                                    <p className="text-sm text-gray-400">Vues : {article.vue.length}</p>
                                    <p className="text-sm text-blue-400">Like : {article.reaction1.length}</p>
                                    <p className="text-sm text-red-400">Dislike : {article.reaction2.length}</p>
                                </div>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => handleDelete(article.id)}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Supprimer
                        </button>
                    </div>
                ))}
            </div>
            <Link href={ROUTES.newArticle}>
                <button
                    type="button"
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Créer un article
                </button>
            </Link>
        </div>
    );
}

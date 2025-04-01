"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Article = {
    id: string;
    titre: string;
    texte: string;
    image?: string;
    date: string;
    vue: any[];
    reaction1: any[];
    reaction2: any[];
    auteurId: string;
};

export default function Articlepage() {
    const params = useParams(); 


    const id = params?.id as string | undefined;
    console.log("ID de l'article :", id);
    const [article, setArticle] = useState<Article | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("ID reçu :", id);
        if (!id) return;

        setError(null);
        setLoading(true);

            
    fetch(`/api/article_page/${id}`)
    .then((response) => {
        console.log("Réponse de l'API :", response);
        if (!response.ok) throw new Error("Article non trouvé");
        return response.json();
    })
    .then((data) => {
        setArticle(data);
        setLoading(false);
    })
    .catch((error) => {
        setError(error.message);
        console.error("Erreur lors de la récupération de l'article :", error);
        setLoading(false);
    });
    }, [id]);


    if (loading) return <p>Chargement...</p>;
    if (error) return <p>Erreur : {error}</p>;
    if (!article) return <p>Aucun article trouvé</p>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">{article.titre}</h1>
            <p className="text-gray-700">{article.texte}</p>
            {article.image && (
                <img src={article.image} alt={article.titre} className="mt-2 rounded-md" />
            )}
            <p className="text-sm text-gray-500">
                Publié le {new Date(article.date).toLocaleDateString()}
            </p>
            <p className="text-sm font-semibold">Auteur : {article.auteurId}</p>
        </div>
    );
};


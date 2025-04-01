"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavbarAff from "../../Components/navigation/Navbar_aff";
import Footer from "../../Components/navigation/Footer";

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
    auteur?: {
        id: string;
        pseudo: string;
    };
};



export default function Articlepage() {
    const params = useParams();
    const id = params?.id as string | undefined;

    const [article, setArticle] = useState<Article | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchArticle = async (): Promise<void> => {
            setError(null);
            setLoading(true);

            try {
                const response = await fetch(`/api/article_page/${id}`);
                if (!response.ok) throw new Error("Erreur lors du chargement de l'article");

                const data: Article = await response.json();
                setArticle(data);
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    if (loading) return <p>Chargement...</p>;
    if (error) return <p>Erreur : {error}</p>;
    if (!article) return <p>Aucun article trouvé</p>;

    return (
        <>
            <NavbarAff />
            <div className="min-h-screen flex flex-col items-center mt-10">
                <div className="bg-[#D9D9D9] p-8 rounded-lg shadow-md w-full max-w-3xl">
                    <h1 className="text-4xl font-bold text-[#996C44] mb-6 text-center">
                        {article.titre}
                    </h1>
                    <p className="text-xl font-semibold text-[#996C44] mb-4 text-center">
                        {article.auteur?.pseudo || "Auteur inconnu"}
                    </p>
                    <p className="text-gray-700 mb-4">{article.texte}</p>
                    {article.image && (
                        <img
                            src={article.image}
                            alt={article.titre}
                            className="w-full h-auto rounded-md mb-6"
                        />
                    )}
                   
                    <p className="text-sm text-gray-500 mb-2">
                        Publié le {new Date(article.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
}

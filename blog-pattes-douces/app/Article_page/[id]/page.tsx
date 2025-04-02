"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
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
    commentaires: {
        id: string;
        texte: string;
        date: string;
        commentataireId: string;
        commentataire?: {
            id: string;
            pseudo: string;
        };
        article_sourceId: string;
    }[];
};

export default function Articlepage() {
    const params = useParams();
    const router = useRouter(); // Initialize useRouter
    const id = params?.id as string | undefined;

    const [article, setArticle] = useState<Article | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState<string>("");

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

    const handleAddComment = async () => {
        if (!commentText.trim()) {
            alert("Le commentaire ne peut pas être vide.");
            return;
        }

        const userId = localStorage.getItem("user_id");
        if (!userId) {
            alert("Vous devez être connecté pour ajouter un commentaire.");
            return;
        }

        try {
            const response = await fetch("/api/commentaires", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_article: id,
                    texte: commentText,
                    commentataireId: userId,
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de l'ajout du commentaire");

            alert("Commentaire ajouté avec succès !");
            setCommentText("");

            // Refresh the article to show the new comment
            const updatedArticle = await fetch(`/api/article_page/${id}`).then((res) => res.json());
            setArticle(updatedArticle);
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire :", error);
        }
    };

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (!userId || !id) return;

        const addView = async () => {
            try {
                const response = await fetch(`/api/article_page/${id}/addView`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId }),
                });

                if (!response.ok) throw new Error("Erreur lors de l'ajout de la vue");

                // Fetch the updated article to reflect the new view count
                const updatedArticle = await fetch(`/api/article_page/${id}`).then((res) => res.json());
                setArticle(updatedArticle);
            } catch (error) {
                console.error("Erreur lors de l'ajout de la vue :", error);
            }
        };

        addView();
    }, [id]);

    if (loading) return <p>Chargement...</p>;
    if (error) return <p>Erreur : {error}</p>;
    if (!article) return <p>Aucun article trouvé</p>;
    
    return (
        <>
            <NavbarAff />
            <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="flex items-center text-blue-600 hover:underline mb-6"
            >
                <span role="img" aria-label="back" className="mr-2">
                🔙
                </span>
            </button>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                {article.titre}
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                Par {article.auteur?.pseudo || "Auteur inconnu"} -{" "}
                {new Date(article.date).toLocaleDateString()}
                </p>
                {article.image && (
                <div className="flex justify-center mb-6">
                    <img
                    src={article.image}
                    alt={article.titre}
                    className="rounded-lg max-w-full h-auto"
                    />
                </div>
                )}
                <p className="text-gray-700 leading-relaxed mb-6">
                {article.texte}
                </p>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Commentaires
                </h2>
                {article.commentaires?.length ? (
                <div className="space-y-4">
                    {article.commentaires.map((commentaire) => (
                    <div
                        key={commentaire.id}
                        className="bg-gray-100 p-4 rounded-lg shadow-sm"
                    >
                        <p className="text-sm text-gray-600 mb-2">
                        {commentaire.commentataire?.pseudo || "Commentateur inconnu"} -{" "}
                        {new Date(commentaire.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-800">{commentaire.texte}</p>
                    </div>
                    ))}
                </div>
                ) : (
                <p className="text-gray-500">Aucun commentaire pour cet article.</p>
                )}
            </div>
            <div className="mt-6">
                <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ajoutez un commentaire..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                />
                <button
                onClick={handleAddComment}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                Ajouter un commentaire
                </button>
            </div>
            </div>
            <Footer />
        </>
    );
}
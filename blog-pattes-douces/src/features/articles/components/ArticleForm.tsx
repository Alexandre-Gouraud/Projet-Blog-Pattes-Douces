"use client";

import { useState, useRef } from "react";
import React from "react";
import type { PutBlobResult } from '@vercel/blob';
import { createArticle, uploadImage } from "@/lib/api-client";
import { useUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

export default function ArticleForm() {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [, setBlob] = useState<PutBlobResult | null>(null);
    const userId = useUserId();

    const handlePostCreation = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const titre = formData.get("titre") as string;
        const texte = formData.get("texte") as string;

        // Verifie la connexion AVANT d'envoyer l'image : sinon l'image serait
        // stockee sans qu'aucun article ne la reference.
        if (!userId) {
            console.error("Utilisateur non connecté");
            return;
        }

        try {
            let imageUrl = "";
            if (inputFileRef.current?.files?.length) {
                const file = inputFileRef.current.files[0];
                const newBlob = (await uploadImage(file)) as PutBlobResult;
                setBlob(newBlob);
                imageUrl = newBlob.url;
            }

            const { message } = await createArticle({ titre, texte, userId, imageUrl });
            alert(message || "Article créé avec succès.");
            window.location.href = ROUTES.profile;
        } catch (err) {
            console.error("Une erreur s'est produite. Veuillez réessayer.", err);
            alert(err instanceof Error ? err.message : "Une erreur s'est produite. Veuillez réessayer.");
        }
    };

    return (
        <>
            <div className="min-h flex flex-col items-center justify-center mt-10">
                <h1 className="text-4xl font-bold text-[#996C44] mb-6">
                    Créer un nouveau post
                </h1>
                <form
                    onSubmit={handlePostCreation}
                    className="bg-[#D9D9D9] p-8 rounded-lg shadow-md w-full max-w-md"
                >
                    <div className="mb-4">
                        <input
                            type="text"
                            name="titre"
                            placeholder="Titre"
                            required
                            className="w-full p-3 border border-[#996C44] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB371]"
                        />
                    </div>
                    <div className="mb-4">
                        <textarea
                            name="texte"
                            placeholder="Texte"
                            required
                            className="w-full p-3 border border-[#996C44] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#FFB371]"
                        />
                    </div>
                    <div className="mb-4">
                        <h1>Télécharger votre image:</h1>
                        <input name="file" ref={inputFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#FFB371] text-white py-3 rounded-lg hover:bg-[#996C44] transition-colors"
                    >
                        Publier
                    </button>
                </form>
            </div>
        </>
    );
}

"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import Footer from "../navigation/Footer";
import Navbar from "../navigation/Navbar";
import type { PutBlobResult } from '@vercel/blob';

export default function Creation_article() {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [blob, setBlob] = useState<PutBlobResult | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUserId(localStorage.getItem("user_id"));
        }
    }, []);

    const handlePostCreation = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const titre = formData.get("titre") as string;
        const texte = formData.get("texte") as string;

        let imageUrl = "";
        if (inputFileRef.current?.files) {
            const file = inputFileRef.current.files[0];
            const uploadResponse = await fetch(`/api/avatar/upload?filename=${file.name}`, {
                method: 'POST',
                body: file,
            });
            const newBlob = (await uploadResponse.json()) as PutBlobResult;
            setBlob(newBlob);
            imageUrl = newBlob.url;
        }

        try {
            const response = await fetch("/api/creation_article", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ titre, texte, userId, imageUrl }),
            });

            const { message } = await response.json();
            if (!response.ok) {
                console.error("Erreur serveur:", message);
                return;
            }
            alert(message || "Article créé avec succès.");
            window.location.href = "/Profil"; 
        } catch (err) {
            console.error("Une erreur s'est produite. Veuillez réessayer.", err);
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
                        <input name="file" ref={inputFileRef} type="file" required />
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

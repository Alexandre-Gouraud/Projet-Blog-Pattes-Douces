"use client";

import Link from "next/link";
import React, { useState } from "react";
import { login } from "@/lib/api-client";
import { saveSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const pseudo = formData.get("pseudo") as string;
        const password = formData.get("password") as string;

        try {
            // La reponse porte directement l'id : plus d'appel separe pour le recuperer.
            const { user } = await login(pseudo, password);
            saveSession(user);
            window.location.href = ROUTES.feed;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de la connexion.");
        }
    };

    return (
        <div className="min-h flex flex-col items-center justify-center mt-10">
            <h1 className="text-4xl font-bold text-[#996C44] mb-6">Connexion</h1>
            <form
                onSubmit={handleSubmit}
                className="bg-[#D9D9D9] p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <div className="mb-4">
                    <input
                        type="text"
                        name="pseudo"
                        placeholder="Pseudo"
                        className="w-full p-3 border border-[#996C44] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB371]"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        className="w-full p-3 border border-[#996C44] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB371]"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-[#FFB371] text-white py-3 rounded-lg hover:bg-[#996C44] transition-colors"
                >
                    Login
                </button>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <p className="mt-6 text-[#444444]">
                Première fois sur Pattes Douces ?{" "}
                <Link href={ROUTES.register} className="text-[#996C44] underline hover:text-[#FFB371]">
                    Inscris-toi
                </Link>
            </p>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import NavbarAff from "../Components/navigation/Navbar_aff";
import Footer from "../Components/navigation/Footer";

export default function Inscription() {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const pseudo = formData.get("pseudo") as string;
        const mail = formData.get("mail") as string;
        const biographie = formData.get("biographie") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        try {
            if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
            }

            if (!/[A-Z]/.test(password)) {
            setError("Le mot de passe doit contenir au moins une lettre majuscule.");
            return;
            }

            if (!/[a-z]/.test(password)) {
            setError("Le mot de passe doit contenir au moins une lettre minuscule.");
            return;
            }

            if (!/[0-9]/.test(password)) {
            setError("Le mot de passe doit contenir au moins un chiffre.");
            return;
            }

            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setError("Le mot de passe doit contenir au moins un caractère spécial.");
            return;
            }

            if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
            }

            const response = await fetch("/api/inscription", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pseudo, mail, biographie, password }),
            });

            const { message } = await response.json();
            if (!response.ok) {
            setError(message || "Erreur lors de l'inscription.");
            return;
            }
            alert(message || "Inscription réussie.");
            window.location.href = "/Connexion"; 
        } catch (err) {
            setError("Une erreur s'est produite. Veuillez réessayer.");
        }
    };

    return (
        <><NavbarAff />
            <div className="min-h flex flex-col items-center justify-center mt-10">
                <h1 className="text-4xl font-bold text-[#996C44] mb-6">Inscription</h1>
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#D9D9D9] p-8 rounded-lg shadow-md w-full max-w-md"
                >
                    <div className="mb-4">
                        <input
                            type="text"
                            name="pseudo"
                            placeholder="Pseudo"
                            required
                            className="w-full p-3 border border-[#996C44] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB371]" />
                    </div>
                    <div className="mb-4">
                        <input
                            type="email"
                            name="mail"
                            placeholder="E-Mail"
                            required
                            className="w-full p-3 border border-[#996C44] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB371]" />
                    </div>
                    <div className="mb-4">
                        <textarea
                            name="biographie"
                            placeholder="Biographie"
                            className="w-full p-3 border border-[#996C44] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#FFB371]" />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            className="w-full p-3 border border-[#996C44] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB371]" />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmer le mot de passe"
                            required
                            className="w-full p-3 border border-[#996C44] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB371]" />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#FFB371] text-white py-3 rounded-lg hover:bg-[#996C44] transition-colors"
                    >
                        S'inscrire
                    </button>
                </form>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                <p className="mt-6 text-[#444444]">
                    Déjà un compte ?{" "}
                    <a href="../Connexion" className="text-[#996C44] underline hover:text-[#FFB371]">
                        Connexion
                    </a>
                </p>
            </div>
            <Footer />
        </>
    );
}
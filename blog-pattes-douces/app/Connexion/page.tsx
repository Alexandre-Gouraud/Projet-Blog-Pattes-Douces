"use client";

import React, { useState } from "react";
import Navbar from "../layout/navigation/Navbar";
import NavbarAff from "../layout/navigation/Navbar_aff";
import Navbar_connecte from "../layout/navigation/Navbar_connecte";
import Header from "../layout/navigation/Header";
import Footer from "../layout/navigation/Footer";
import Posts from "../Components/Posts/Posts";
import Feedhome from "../Components/feed";

export default function Connexion() {
    const [error, setError] = useState<string | null>(null);

    const getUserId = async (pseudo: string) => {
        try {
            const response = await fetch(`/api/get_userid?pseudo=${encodeURIComponent(pseudo)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const { message } = await response.json();
                setError(message || "Erreur lors de la récupération de l'ID utilisateur.");
                return;
            }

            const { user_id } = await response.json();
            localStorage.setItem("user_id", user_id);
            console.log("ID utilisateur récupéré :", user_id);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'ID utilisateur :", error);
            setError("Erreur lors de la récupération de l'ID utilisateur.");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const pseudo = formData.get("pseudo") as string;
        const password = formData.get("password") as string;

        try {
            const response = await fetch("/api/connexion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pseudo, password }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                setError(message || "Erreur lors de la connexion.");
                return;
            }

            localStorage.setItem("pseudo", pseudo); // Store pseudo in localStorage
            await getUserId(pseudo); // Fetch and store user ID
            window.location.href = "/Feed"; // Redirect to the feed page
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            setError("Erreur lors de la connexion.");
        }

    };

    return (
        <>
            <NavbarAff />
            <div className="min-h flex flex-col items-center justify-center mt-10">
                <h1 className="text-4xl font-bold text-[#996C44] mb-6">Connexion</h1>
                <form
                    onSubmit={handleSubmit }
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
                    <a href="../Inscription" className="text-[#996C44] underline hover:text-[#FFB371]">
                        Inscris-toi
                    </a>
                </p>
            </div>
            <Footer />
        </>
    );
}

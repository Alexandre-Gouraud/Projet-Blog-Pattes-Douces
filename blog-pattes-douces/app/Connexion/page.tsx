"use client";

import React from "react"; 
import { useState } from "react";
import NavbarAff from "../Components/navigation/Navbar_aff";
import Header from "../Components/navigation/Header";
import Footer from "../Components/navigation/Footer";

export default function Connexion() {
    const [error, setError] = useState<string | null>(null);
    
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

            if (response.ok) {
                localStorage.setItem("pseudo", pseudo); // Stocker le pseudo dans le localStorage
                window.location.href = "/Feed"; // Rediriger vers la page d'accueil
            }
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
                <a href="../Inscription" className="text-[#996C44] underline hover:text-[#FFB371]">
                Inscris-toi
                </a>
            </p>
            </div>

            <Footer />
        </>
    );
}

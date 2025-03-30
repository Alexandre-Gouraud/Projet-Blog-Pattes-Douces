"use client";

import React, { useState } from "react";
import NavbarAff from "../Components/navigation/Navbar_aff";
import Footer from "../Components/navigation/Footer";

export default function Connexion() {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const id_user = formData.get("id_user") as string;
        const pseudo = formData.get("pseudo") as string;
        const password = formData.get("password") as string;

        try {
            const response = await fetch("/api/connexion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id_user, pseudo, password }),
            });

            const data = await response.json(); // Attendre la réponse JSON

            if (!response.ok) {
                setError(data.message || "Erreur lors de la connexion.");
                return;
            }

            localStorage.setItem("pseudo", pseudo);
            localStorage.setItem("id_user", id_user);
            window.location.href = "/Feed"; // Redirection après connexion
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            setError("Erreur lors de la connexion.");
        }
    };

    return (
        <>
            <NavbarAff />
<<<<<<< Updated upstream
            <Header />
        
            <h1>Connexion</h1>
            <br />
            <form onSubmit={handleSubmit}>
                <input type="text" name="pseudo" placeholder="Pseudo" />
                <br />
                <input type="password" name="password" placeholder="Password" required />
                <br />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>Première fois sur Pattes Douces ? <a href="../Inscription">Inscris-toi</a></p>
=======
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
                    <input type="hidden" name="id_user" value="12345" /> {/* ID utilisateur caché */}
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
>>>>>>> Stashed changes
            <Footer />
        </>
    );
}

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
              const { message, userId } = await response.json();
              alert(message || "Connexion réussie"); // Afficher un message si la connexion est réussie
              localStorage.setItem("userId", userId); // Enregistrer l'id de l'utilisateur dans le localStorage
              window.location.href = "../Feed"; // Rediriger vers la page d'accueil
            }
            setError(null); // Réinitialiser l'erreur en cas de succès
            // Redirection après connexion réussie
        } catch (err) {
            setError("Une erreur s'est produite. Veuillez réessayer.");
        }
    };

    return (
        <>
            <NavbarAff />
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
            <Footer />
        </>
    );
}

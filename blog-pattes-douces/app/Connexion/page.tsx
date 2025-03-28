"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Connexion() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

   
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const pseudo = formData.get("pseudo") as string;
        const password = formData.get("password") as string;
        
            
        try {
            

            const response = await fetch("/api/connexion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pseudo, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Erreur lors de la connexion.");
                return;
            }

            localStorage.setItem("userId", data.userId);
            alert(data.message || "Connexion réussie");
            router.push("/Feed"); // Utilise Next.js pour la navigation
        } catch (err) {
            setError("Une erreur s'est produite. Veuillez réessayer.");
        }
    };

    return (
        <>
            <h1>Connexion</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="pseudo" placeholder="Pseudo" required />
                <input type="password" name="password" placeholder="Mot de passe" required />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>Première fois sur Pattes Douces ? <a href="../Inscription">Inscris-toi</a></p>
        </>
    );
}



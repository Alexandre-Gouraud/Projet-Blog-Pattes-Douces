"use client";

import React, { useState } from "react";

export default function Inscription() {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const pseudo = formData.get("pseudo") as string;
        const mail = formData.get("mail") as string;
        const biographie = formData.get("biographie") as string;
        const password = formData.get("password") as string;

        try {
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
            window.location.href = "/connexion";
        } catch (err) {
            setError("Une erreur s'est produite. Veuillez réessayer.");
        }
    };

    return (
        <>
            <h1>Inscription</h1>
            <br />
            <form onSubmit={handleSubmit}>
                <input type="text" name="pseudo" placeholder="Pseudo" required /><br />
                <input type="email" name="mail" placeholder="E-Mail" required /><br />
                <input type="text" name="biographie" placeholder="Biographie" /><br />
                <input type="password" name="password" placeholder="Password" required /><br />
                <button type="submit">S'inscrire</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>Déjà un compte ? <a href="/connexion">Connexion</a></p>
        </>
    );
}

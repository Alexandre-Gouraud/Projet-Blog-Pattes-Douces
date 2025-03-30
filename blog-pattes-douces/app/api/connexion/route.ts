import { prisma } from "@/src/db/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const {id, pseudo, password } = await request.json();

        // Vérification des champs obligatoires
        if (!pseudo || !password) {
            return NextResponse.json({ message: "Pseudo et mot de passe requis" }, { status: 400 });
        }

        // Recherche de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { pseudo },
            select: {
                id: true, // id de l'utilisateur
                password: true,
            },
        });

        if (!user) {
            return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
        }

<<<<<<< Updated upstream
        if (user.password !== password) {
=======
        // Vérification du mot de passe
        const motDePasseValide = await bcrypt.compare(password, user.password);
        if (!motDePasseValide) {
>>>>>>> Stashed changes
            return NextResponse.json({ message: "Mot de passe incorrect" }, { status: 401 });
        }

        // Réponse avec id_user et redirection
        return NextResponse.json({ 
            message: "Connexion réussie", 
            id_user: user.id, // ID de l'utilisateur
            redirectUrl: "/Feed"
        }, { status: 200 });

    } catch (error) {
        console.error("Erreur lors de la connexion :", error instanceof Error ? error.message : error);
        return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
    }
}

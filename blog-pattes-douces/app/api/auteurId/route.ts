import { NextResponse } from "next/server";
import { prisma } from "../../../src/db/prisma";

// Gestionnaire pour les requêtes GET
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const pseudo = searchParams.get("pseudo");

    try {
        // Vérifiez que le pseudo est fourni
        if (!pseudo || typeof pseudo !== "string") {
            return NextResponse.json({ error: "Pseudo invalide ou manquant" }, { status: 400 });
        }

        // Recherchez l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
            where: { pseudo },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        // Retournez l'ID utilisateur
        return NextResponse.json({ user_id: user.id }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'ID utilisateur :", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}

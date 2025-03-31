import { NextResponse } from "next/server";
import { prisma } from "../../../src/db/prisma";

// Gestionnaire pour les requêtes GET
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const pseudo = searchParams.get("pseudo");

    try {
        // Vérifiez que le pseudo est fourni
        if (!pseudo || typeof pseudo !== "string") {
            return NextResponse.json({ message: "Pseudo manquant ou invalide." }, { status: 400 });
        }

        // Recherchez l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
            where: { pseudo },
        });

        if (!user) {
            return NextResponse.json({ message: "Utilisateur non trouvé." }, { status: 404 });
        }

        // Retournez l'ID utilisateur
        return NextResponse.json({ user_id: user.id }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'ID utilisateur :", error);
        return NextResponse.json({ message: "Erreur interne du serveur." }, { status: 500 });
    }
}
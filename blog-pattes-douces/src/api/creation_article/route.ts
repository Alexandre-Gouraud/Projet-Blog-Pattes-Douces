import {prisma} from "@/src/db/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Parse request JSON
        const { titre, texte, userId, imageUrl } = await request.json();

        // Validate input
        if (!titre || !texte || !userId) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        // Create article in database
        await prisma.article.create({
            data: {
                titre,
                texte,
                image: imageUrl,
                vue: [],
                reaction1: [],
                reaction2: [],
                auteur: {
                    connect: { id: userId },
                },
            },
        });

        return NextResponse.json({ message: "Article créé avec succès" }, { status: 200 });

    } catch (error) {
        console.error("Erreur lors de la création de l'article:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}

import {prisma} from "@/src/db/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const { pseudo, password } = await request.json();
    // Validate input
    if (!pseudo || !password) {
        return NextResponse.json({ message: "Pseudo et mot de passe requis" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { pseudo: pseudo },
        });

        if (!user) {
            return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
        }

        const MotdePasseCrypte = await bcrypt.compare(password, user.password);
        if (!MotdePasseCrypte) {
            return NextResponse.json({ message: "Mot de passe incorrect" }, { status: 401 });
        }
        return NextResponse.json({ message: "Connexion réussie", redirectUrl: "/app/pages.tsx" }, { status: 200 });


    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
    }
}


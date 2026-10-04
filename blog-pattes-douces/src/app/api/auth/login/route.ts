import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readJson } from "@/lib/http";

// Meme message et meme statut que le pseudo existe ou non : la reponse ne doit
// pas permettre de savoir quels comptes existent.
const INVALID_CREDENTIALS = "Pseudo ou mot de passe incorrect";
// Compare a un hash factice quand le pseudo est inconnu, pour que le temps de
// reponse ne trahisse pas non plus l'existence du compte.
const DUMMY_HASH = bcrypt.hashSync("pattes-douces-dummy-password", 10);

export async function POST(request: Request) {
    const body = await readJson(request);
    const pseudo = body?.pseudo;
    const password = body?.password;
    // Validate input
    if (typeof pseudo !== "string" || typeof password !== "string" || !pseudo || !password) {
        return NextResponse.json({ message: "Pseudo et mot de passe requis" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { pseudo },
            select: { id: true, pseudo: true, password: true },
        });

        const passwordOk = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
        if (!user || !passwordOk) {
            return NextResponse.json({ message: INVALID_CREDENTIALS }, { status: 401 });
        }
        return NextResponse.json(
            { message: "Connexion réussie", user: { id: user.id, pseudo: user.pseudo } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
    }
}

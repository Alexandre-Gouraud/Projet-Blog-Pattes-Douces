import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { readJson } from "@/lib/http";
import { LIMITS, isEmail, passwordError } from "@/lib/validation";

export async function POST(request: Request) {
    const body = await readJson(request);
    const pseudo = typeof body?.pseudo === "string" ? body.pseudo.trim() : "";
    const mail = typeof body?.mail === "string" ? body.mail.trim() : "";
    const biographie = typeof body?.biographie === "string" ? body.biographie.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    // La validation du formulaire se contourne en appelant l'API directement :
    // les memes regles sont donc reappliquees ici.
    if (pseudo.length < LIMITS.pseudo.min || pseudo.length > LIMITS.pseudo.max) {
        return NextResponse.json(
            { message: `Le pseudo doit contenir entre ${LIMITS.pseudo.min} et ${LIMITS.pseudo.max} caractères.` },
            { status: 400 }
        );
    }
    if (!isEmail(mail)) {
        return NextResponse.json({ message: "Adresse e-mail invalide." }, { status: 400 });
    }
    if (biographie.length > LIMITS.biographie) {
        return NextResponse.json({ message: "La biographie est trop longue." }, { status: 400 });
    }
    const invalidPassword = passwordError(password);
    if (invalidPassword) {
        return NextResponse.json({ message: invalidPassword }, { status: 400 });
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { pseudo: pseudo },
                    { email: mail }
                ]
            },
            select: { pseudo: true, email: true },
        });

        if (existingUser) {
            if (existingUser.pseudo === pseudo) {
                return NextResponse.json({ message: "Ce pseudo est déjà utilisé" }, { status: 409 });
            }
            if (existingUser.email === mail) {
                return NextResponse.json({ message: "Cet email est déjà utilisé" }, { status: 409 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                pseudo,
                email: mail,
                biographie: biographie || null,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: "Inscription réussie" }, { status: 201 });
    } catch (error) {
        // Deux inscriptions simultanees peuvent passer la verification ci-dessus :
        // l'index unique de la base tranche.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return NextResponse.json({ message: "Ce pseudo ou cet email est déjà utilisé" }, { status: 409 });
        }
        console.error("Error during register:", error);
        return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId } = await req.json();
        const articleId = params.id;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const article = await prisma.article.findUnique({
            where: { id: articleId },
            select: { reaction1: true },
        });

        if (!article) {
            return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
        }

        if (article.reaction1.includes(userId)) {
            const updatedArticle = await prisma.article.update({
                where: { id: articleId },
                data: {
                    reaction1: { set: article.reaction1.filter((id: string) => id !== userId) },
                },
            });

            return NextResponse.json(updatedArticle, { status: 200 });
        }

        const updatedArticle = await prisma.article.update({
            where: { id: articleId },
            data: {
                reaction1: { push: userId },
            },
        });

        return NextResponse.json(updatedArticle, { status: 200 });
    } catch (error) {
        console.error("Erreur :", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

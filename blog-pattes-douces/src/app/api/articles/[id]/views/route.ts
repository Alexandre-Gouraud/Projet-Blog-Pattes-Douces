import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: RouteContext<"/api/articles/[id]/views">) {
    try {
        const { userId } = await req.json();
        const { id: articleId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const article = await prisma.article.findUnique({
            where: { id: articleId },
            select: { vue: true },
        });

        if (!article) {
            return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
        }

        if (!article.vue.includes(userId)) {
            await prisma.article.update({
                where: { id: articleId },
                data: {
                    vue: { push: userId },
                },
            });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Erreur :", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

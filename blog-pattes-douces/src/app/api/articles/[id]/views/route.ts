import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, readJson } from "@/lib/http";
import { isObjectId } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: RouteContext<"/api/articles/[id]/views">) {
    try {
        const userId = (await readJson(req))?.userId;
        const { id: articleId } = await params;

        if (!isObjectId(articleId) || !isObjectId(userId)) {
            return badRequest("Identifiant invalide");
        }

        const [article, user] = await Promise.all([
            prisma.article.findUnique({ where: { id: articleId }, select: { vue: true } }),
            prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
        ]);

        if (!article) {
            return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
        }
        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
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

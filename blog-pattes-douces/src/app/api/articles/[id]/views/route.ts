import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/http";
import { requireUser } from "@/lib/auth/server";
import { isObjectId } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: RouteContext<"/api/articles/[id]/views">) {
    const auth = await requireUser(req);
    if (auth.response) return auth.response;
    const userId = auth.user.id;

    try {
        const { id: articleId } = await params;

        if (!isObjectId(articleId)) {
            return badRequest("Identifiant invalide");
        }

        const article = await prisma.article.findUnique({ where: { id: articleId }, select: { vue: true } });

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

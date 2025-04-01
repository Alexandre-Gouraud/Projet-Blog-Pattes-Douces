import { NextResponse } from "next/server";
import {prisma} from "@/src/db/prisma";

export async function GET() {
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null; // Récupération de l'id_user depuis le localStorage

  const articles_user = await prisma.article.findMany({
    where: { auteurId: "user_id"},
    orderBy: { date: "desc" },
  });

  return NextResponse.json(articles_user);
}

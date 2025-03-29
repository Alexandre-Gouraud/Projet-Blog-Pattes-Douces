import { NextResponse } from "next/server";
import prisma from "@/src/db/prisma1";

export async function GET() {
  const articles_user = await prisma.article.findMany({
    where: { id_user: "67e171b2681e5e20719952c4" },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(articles_user);
}

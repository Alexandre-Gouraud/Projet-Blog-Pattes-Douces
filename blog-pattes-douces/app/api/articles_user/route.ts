import { NextResponse } from "next/server";
import prisma from "@/src/db/prisma1";

export async function GET() {

  const articles_user = await prisma.article.findMany({
    where: { auteurId: "67eab2c1bbb0b4f399cca109" },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(articles_user);
}

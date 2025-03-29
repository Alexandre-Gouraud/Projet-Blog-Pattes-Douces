import { NextResponse } from "next/server";
import prisma from "@/src/db/prisma1";

export async function POST(req: Request) {
    try {
      const { id } = await req.json();
      await prisma.article.delete({ where: { id } });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ success: false, error: "Failed to delete article" }, { status: 500 });
    }
  }
  
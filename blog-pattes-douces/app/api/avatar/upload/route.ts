import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import {prisma} from "@/src/db/prisma";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  const fileBuffer = await request.arrayBuffer(); // Convert request body to binary data

  const blob = await put(filename, fileBuffer, {
    access: 'public',
  });

  return NextResponse.json(blob);
}

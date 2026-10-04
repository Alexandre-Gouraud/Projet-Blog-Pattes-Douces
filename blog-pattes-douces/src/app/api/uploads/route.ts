import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { ALLOWED_IMAGE_TYPES, LIMITS } from '@/lib/validation';

const EXTENSIONS: Record<(typeof ALLOWED_IMAGE_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/** Nom de fichier sur : sans chemin ni caracteres speciaux, extension imposee par le type. */
function safeFilename(filename: string, extension: string): string {
  const base = filename
    .replace(/\.[^.]*$/, '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `articles/${base || 'image'}.${extension}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "L'upload d'images n'est pas configuré" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Seules des images sont acceptees : sinon n'importe quel fichier (HTML,
  // executable...) serait heberge publiquement sous le domaine du blob.
  const contentType = request.headers.get('content-type')?.split(';')[0].trim() ?? '';
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(contentType)) {
    return NextResponse.json({ error: 'Format accepté : JPEG, PNG, WebP ou GIF' }, { status: 415 });
  }
  const extension = EXTENSIONS[contentType as keyof typeof EXTENSIONS];

  const tooLarge = NextResponse.json({ error: 'Image trop lourde (4 Mo maximum)' }, { status: 413 });
  if (Number(request.headers.get('content-length') ?? 0) > LIMITS.imageBytes) {
    return tooLarge;
  }

  const fileBuffer = await request.arrayBuffer(); // Convert request body to binary data
  // Content-Length peut etre absent ou faux : la taille reelle fait foi.
  if (fileBuffer.byteLength === 0 || fileBuffer.byteLength > LIMITS.imageBytes) {
    return fileBuffer.byteLength === 0
      ? NextResponse.json({ error: 'Fichier vide' }, { status: 400 })
      : tooLarge;
  }

  try {
    const blob = await put(safeFilename(filename, extension), fileBuffer, {
      access: 'public',
      contentType,
      // Deux images de meme nom ne s'ecrasent pas et ne font pas echouer l'upload.
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Erreur lors de l'upload :", error);
    return NextResponse.json({ error: "Erreur lors de l'upload de l'image" }, { status: 500 });
  }
}

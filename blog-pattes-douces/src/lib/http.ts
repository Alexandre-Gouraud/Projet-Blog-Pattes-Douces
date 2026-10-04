import { NextResponse } from "next/server";

/**
 * Corps JSON de la requete, ou `null` s'il est absent, invalide ou n'est pas un
 * objet. Evite qu'un corps mal forme fasse planter la route en 500.
 */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Reponse 400 avec le format `{ error }` attendu par lib/api-client. */
export function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/server";

const NO_STORE = { "Cache-Control": "no-store" };

/** Utilisateur de la session courante, ou 401. Jamais mis en cache. */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Connexion requise" }, { status: 401, headers: NO_STORE });
    }
    return NextResponse.json({ user }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("Error reading session:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500, headers: NO_STORE });
  }
}

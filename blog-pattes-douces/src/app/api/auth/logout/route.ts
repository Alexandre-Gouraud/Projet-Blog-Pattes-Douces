import { NextResponse } from "next/server";
import { destroySession, rejectCrossOrigin } from "@/lib/auth/server";

/** Deconnexion : supprime la session en base et le cookie. Idempotent. */
export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;
  try {
    await destroySession();
    return NextResponse.json({ message: "Déconnexion réussie" }, { status: 200 });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}

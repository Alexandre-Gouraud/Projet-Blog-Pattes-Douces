import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCrossOriginMutation } from "./origin";
import {
  SESSION_COOKIE,
  cookieOptions,
  generateToken,
  hashToken,
  isExpired,
  sessionExpiry,
  shouldRenew,
} from "./token";

/** Utilisateur de la session courante (jamais l'email ni le mot de passe). */
export type SessionUser = { id: string; pseudo: string; espece: string | null };

/**
 * Ouvre une session : jeton aleatoire dans un cookie httpOnly, hash seul en
 * base. Remplace la session eventuellement deja presente (pas de fixation).
 * A appeler depuis un route handler.
 */
export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const previous = cookieStore.get(SESSION_COOKIE)?.value;
  if (previous) await prisma.session.deleteMany({ where: { tokenHash: hashToken(previous) } });

  const now = new Date();
  // Menage au passage : les sessions expirees n'ont plus d'utilite.
  await prisma.session.deleteMany({ where: { expiresAt: { lte: now } } });

  const token = generateToken();
  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt: sessionExpiry(now), lastSeenAt: now },
  });
  cookieStore.set(SESSION_COOKIE, token, cookieOptions());
}

/** Utilisateur de la session, ou null (cookie absent, inconnu ou expire). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      expiresAt: true,
      lastSeenAt: true,
      user: { select: { id: true, pseudo: true, espece: true } },
    },
  });
  if (!session) return null;

  const now = new Date();
  if (isExpired(session.expiresAt, now)) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  // Renouvellement glissant : base et cookie sont prolonges ensemble.
  if (shouldRenew(session.lastSeenAt, now)) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: now, expiresAt: sessionExpiry(now) },
    });
    try {
      cookieStore.set(SESSION_COOKIE, token, cookieOptions());
    } catch {
      // Hors route handler le cookie est en lecture seule : la base est
      // prolongee, le cookie le sera a la prochaine requete d'API.
    }
  }
  return session.user;
}

/** Ferme la session courante (base + cookie). */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(SESSION_COOKIE);
}

export function forbidden(error = "Action non autorisée") {
  return NextResponse.json({ error }, { status: 403 });
}

/**
 * Refus 403 si la requete modifie des donnees depuis une autre origine, sinon null.
 * A appeler en tete de toute route qui change l'etat (y compris login/logout).
 */
export function rejectCrossOrigin(request: Request): NextResponse | null {
  return isCrossOriginMutation(request) ? forbidden("Origine non autorisée") : null;
}

/**
 * Garde des routes qui modifient des donnees : verifie l'origine puis exige une
 * session (401 sinon). L'identite vient TOUJOURS de la session, jamais du corps.
 *
 *   const auth = await requireUser(request);
 *   if (auth.response) return auth.response;
 *   const { user } = auth;
 */
export async function requireUser(
  request: Request
): Promise<{ user: SessionUser; response?: undefined } | { user?: undefined; response: NextResponse }> {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return { response: crossOrigin };
  const user = await getSessionUser();
  if (!user) return { response: NextResponse.json({ error: "Connexion requise" }, { status: 401 }) };
  return { user };
}

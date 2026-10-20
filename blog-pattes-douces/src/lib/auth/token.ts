import { createHash, randomBytes } from "node:crypto";

/**
 * Parties pures des sessions serveur (sans base ni requete) : jeton, hash,
 * expiration et attributs du cookie. Voir ./server.ts pour l'acces a la base.
 */

export const SESSION_COOKIE = "pd_session";
/** Duree de vie d'une session : 30 jours, renouvelee a l'usage. */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
/** La session n'est prolongee qu'une fois par jour (evite une ecriture par requete). */
export const SESSION_RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

/** Jeton aleatoire de 32 octets (256 bits), encode en base64url pour le cookie. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Seul ce hash SHA-256 est stocke : une fuite de la base ne donne aucune session valide. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
}

export function isExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

/** Vrai quand la derniere activite date assez pour prolonger la session. */
export function shouldRenew(lastSeenAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - lastSeenAt.getTime() >= SESSION_RENEW_AFTER_MS;
}

/**
 * Attribut Secure du cookie : par defaut vrai en production, faux sinon (le
 * dev tourne en http). `COOKIE_SECURE` ("true" / "false") le force, par exemple
 * pour servir l'image Docker en http simple. Toute autre valeur est ignoree :
 * on ne bascule jamais en non-securise en production par accident.
 */
export function isCookieSecure(
  nodeEnv: string | undefined = process.env.NODE_ENV,
  override: string | undefined = process.env.COOKIE_SECURE
): boolean {
  const value = override?.trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return nodeEnv === "production";
}

/**
 * Attributs du cookie de session : httpOnly (illisible par JavaScript),
 * SameSite=Lax, Secure selon isCookieSecure.
 */
export function cookieOptions(
  nodeEnv: string | undefined = process.env.NODE_ENV,
  override: string | undefined = process.env.COOKIE_SECURE
) {
  return {
    httpOnly: true,
    secure: isCookieSecure(nodeEnv, override),
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

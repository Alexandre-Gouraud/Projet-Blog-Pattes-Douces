import { createHash, createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Limitation des tentatives de connexion et d'inscription, persistee dans
 * MongoDB (modele `LoginThrottle`) : elle survit aux redemarrages et sert
 * plusieurs instances.
 *
 * Avec une IP de confiance (`TRUST_PROXY=true`, voir client-ip.ts) :
 * - connexion : 5 tentatives par couple (IP, pseudo) et 20 par IP, en 15 min ;
 * - inscription : 20 tentatives par IP en 15 min.
 * Sans IP de confiance, partager un seau entre tous les clients permettrait a
 * n'importe qui de bloquer tout le monde : on n'utilise alors AUCUNE cle IP.
 * Seule reste une limite par pseudo (10 tentatives en 15 min) et l'inscription
 * n'est pas limitee. Compromis : quiconque connait un pseudo peut le verrouiller
 * 15 min ; et, avec `TRUST_PROXY`, une attaque repartie sur de nombreuses IP
 * n'est pas limitee globalement.
 *
 * Le compteur est incremente AVANT la comparaison bcrypt (increment atomique
 * cote base), et la decision se prend sur la valeur retournee : des requetes
 * simultanees ne contournent pas la limite. Le controle ne depend pas de
 * l'existence du compte. Au-dela de la limite : verrouille 15 min.
 * Une connexion reussie remet a zero le compteur (IP, pseudo) ; le compteur IP
 * est seulement decremente de 1 pour ne compter que les echecs.
 */
export const THROTTLE = {
  windowMs: 15 * 60_000,
  lockMs: 15 * 60_000,
  perPair: 5,
  perPseudo: 10,
  perIp: 20,
  /** Probabilite qu'un appel purge les lignes expirees (environ 1 sur 50). */
  cleanupRate: 1 / 50,
} as const;

export type ThrottleRule = {
  key: string;
  limit: number;
  /** Apres une connexion reussie : remise a zero, retrait d'une tentative, ou rien. */
  onSuccess: "reset" | "refund" | "none";
};

/**
 * Empreinte d'une valeur (pseudo, IP) : HMAC-SHA-256 si `THROTTLE_SECRET` est
 * defini, SHA-256 simple sinon. Les cles sont pseudonymisees, pas anonymes :
 * qui connait un pseudo candidat peut recalculer sa cle (sans secret).
 */
function digest(value: string): string {
  const secret = process.env.THROTTLE_SECRET;
  const hash = secret ? createHmac("sha256", secret) : createHash("sha256");
  return hash.update(value).digest("hex").slice(0, 32);
}

/** Pseudo normalise : meme compteur quelle que soit la casse ou la forme Unicode. */
export function normalizePseudo(pseudo: string): string {
  return pseudo.normalize("NFKC").trim().toLowerCase();
}

let warned = false;
function warnNoTrustedIp() {
  if (warned) return;
  warned = true;
  console.warn(
    "[auth] Aucune IP de client de confiance (TRUST_PROXY n'est pas \"true\") : limitation par pseudo seulement, " +
      "inscription non limitee. Definir TRUST_PROXY=true derriere un reverse proxy de confiance pour limiter par IP."
  );
}

export function loginRules(ip: string | null, pseudo: string): ThrottleRule[] {
  const name = normalizePseudo(pseudo);
  if (ip === null) {
    warnNoTrustedIp();
    return [{ key: `login:pseudo:${digest(name)}`, limit: THROTTLE.perPseudo, onSuccess: "reset" }];
  }
  return [
    { key: `login:user:${digest(`${ip}\n${name}`)}`, limit: THROTTLE.perPair, onSuccess: "reset" },
    { key: `login:ip:${digest(ip)}`, limit: THROTTLE.perIp, onSuccess: "refund" },
  ];
}

export function registerRules(ip: string | null): ThrottleRule[] {
  if (ip === null) {
    warnNoTrustedIp();
    return [];
  }
  return [{ key: `register:ip:${digest(ip)}`, limit: THROTTLE.perIp, onSuccess: "none" }];
}

type Row = { count: number; windowStart: Date; lockedUntil: Date | null };

/** Incremente (ou cree) le compteur de facon atomique et retourne la ligne a jour. */
async function increment(key: string, now: Date): Promise<Row> {
  const fresh = { key, count: 1, windowStart: now, lockedUntil: null };
  try {
    return await prisma.loginThrottle.upsert({ where: { key }, create: fresh, update: { count: { increment: 1 } } });
  } catch {
    // Deux premieres requetes simultanees : l'une a cree la ligne entre-temps.
    return await prisma.loginThrottle.update({ where: { key }, data: { count: { increment: 1 } } });
  }
}

/** Secondes restantes si cette tentative est refusee, sinon `null`. */
async function hit({ key, limit }: ThrottleRule, now: Date): Promise<number | null> {
  let row = await increment(key, now);
  const expired =
    now.getTime() - row.windowStart.getTime() >= THROTTLE.windowMs || (row.lockedUntil !== null && row.lockedUntil <= now);
  if (expired) {
    // Nouvelle fenetre. Condition sur windowStart : un seul des appels simultanes la rouvre.
    const reset = await prisma.loginThrottle.updateMany({
      where: { key, windowStart: row.windowStart },
      data: { count: 1, windowStart: now, lockedUntil: null },
    });
    if (reset.count > 0) row = { count: 1, windowStart: now, lockedUntil: null };
  }
  if (row.lockedUntil !== null && row.lockedUntil > now) {
    return Math.ceil((row.lockedUntil.getTime() - now.getTime()) / 1000);
  }
  if (row.count > limit) {
    const lockedUntil = new Date(now.getTime() + THROTTLE.lockMs);
    await prisma.loginThrottle.updateMany({ where: { key, lockedUntil: null }, data: { lockedUntil } });
    return Math.ceil(THROTTLE.lockMs / 1000);
  }
  return null;
}

/**
 * Compte une tentative sur chaque regle. Retourne les secondes avant la fin du
 * verrou le plus long si la tentative est refusee, `null` si elle est permise.
 */
export async function countAttempt(
  rules: ThrottleRule[],
  now = new Date(),
  random: () => number = Math.random
): Promise<number | null> {
  let retryAfter: number | null = null;
  for (const rule of rules) {
    const seconds = await hit(rule, now);
    if (seconds !== null) retryAfter = Math.max(retryAfter ?? 0, seconds);
  }
  if (rules.length > 0 && random() < THROTTLE.cleanupRate) await purgeExpired(now);
  return retryAfter;
}

/** Connexion reussie : remet a zero ou rend la tentative selon la regle. */
export async function releaseOnSuccess(rules: ThrottleRule[]): Promise<void> {
  const reset = rules.filter((r) => r.onSuccess === "reset").map((r) => r.key);
  if (reset.length > 0) await prisma.loginThrottle.deleteMany({ where: { key: { in: reset } } });
  for (const rule of rules) {
    if (rule.onSuccess !== "refund") continue;
    await prisma.loginThrottle.updateMany({ where: { key: rule.key, count: { gt: 0 } }, data: { count: { decrement: 1 } } });
  }
}

/** Supprime les lignes dont la fenetre ET le verrou sont expires. Sans effet sur la reponse en cas d'erreur. */
export async function purgeExpired(now = new Date()): Promise<void> {
  try {
    await prisma.loginThrottle.deleteMany({
      where: {
        windowStart: { lt: new Date(now.getTime() - THROTTLE.windowMs) },
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
      },
    });
  } catch (error) {
    console.error("Error purging login throttle rows:", error);
  }
}

/** Reponse 429 commune : meme corps que pseudo ou mot de passe, connu ou non. */
export function tooManyAttempts(retryAfter: number) {
  return Response.json(
    { message: "Trop de tentatives. Réessayez plus tard.", retryAfter },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

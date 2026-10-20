import { isIP } from "node:net";

/**
 * Adresse IP du client, pour la limitation des tentatives de connexion.
 *
 * Hypothese de confiance : `X-Forwarded-For` / `X-Real-IP` sont fournis par le
 * client et donc falsifiables. Ils ne sont lus que si `TRUST_PROXY=true`, c'est
 * a dire quand l'application n'est joignable qu'a travers un reverse proxy de
 * confiance (Vercel, nginx...) qui AJOUTE l'adresse qu'il a vue en fin de
 * liste. Meme hypothese de confiance que pour `X-Forwarded-Host` dans
 * lib/auth/origin.ts (en-tete pose par le proxy).
 *
 * On prend l'entree la plus a droite : c'est ce que voit le proxy de confiance
 * le plus proche. Les entrees de gauche peuvent avoir ete inventees par le
 * client. Avec plusieurs proxys en chaine, cette entree est l'adresse du proxy
 * precedent, pas celle du client : le seau est alors partage par tous les
 * clients derriere ce proxy (limitation plus stricte, jamais plus laxiste).
 *
 * Une valeur qui n'est pas une adresse IP valide est refusee. Les adresses
 * IPv6 sont ramenees a leur prefixe /64 (un client en possede des milliards).
 *
 * Retourne `null` quand aucune IP fiable n'est disponible : l'appelant ne doit
 * alors PAS s'en servir comme cle (voir throttle.ts).
 */
export function getClientIp(headers: Headers, trustProxy = process.env.TRUST_PROXY === "true"): string | null {
  if (!trustProxy) return null;
  const forwarded = headers.get("x-forwarded-for");
  const raw = forwarded !== null ? forwarded.split(",").at(-1) : headers.get("x-real-ip");
  return raw ? normalizeIp(raw.trim()) : null;
}

/** IPv4 telle quelle, IPv6 ramenee a son prefixe /64 ("2001:db8:0:1::/64"), sinon `null`. */
export function normalizeIp(value: string): string | null {
  const ip = value.replace(/%.*$/, "");
  const version = isIP(ip);
  if (version === 4) return ip;
  if (version !== 6) return null;

  let text = ip.toLowerCase();
  // IPv4 integree ("::ffff:1.2.3.4") : on garde l'adresse IPv4.
  const tail = text.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (tail) {
    if (/^(::ffff:|0:0:0:0:0:ffff:)/.test(text)) return tail[1];
    const [a, b, c, d] = tail[1].split(".").map(Number);
    text = text.replace(tail[1], `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`);
  }
  const [head, rest] = text.split("::");
  const headGroups = head ? head.split(":") : [];
  const restGroups = rest === undefined ? [] : rest ? rest.split(":") : [];
  const missing = 8 - headGroups.length - restGroups.length;
  const groups = rest === undefined ? headGroups : [...headGroups, ...Array<string>(missing).fill("0"), ...restGroups];
  return `${groups.slice(0, 4).map((g) => parseInt(g, 16).toString(16)).join(":")}::/64`;
}

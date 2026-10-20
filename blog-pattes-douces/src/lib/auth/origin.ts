/**
 * Protection CSRF complementaire a SameSite=Lax : une requete qui modifie des
 * donnees doit venir de notre propre origine.
 *
 * - En-tete `Origin` present : son hote doit etre celui du site (`Host`, ou
 *   `X-Forwarded-Host` derriere un proxy).
 * - Sinon, `Sec-Fetch-Site` (envoye par les navigateurs) ne doit pas signaler
 *   une requete inter-sites. Un client sans aucun de ces en-tetes (curl, tests)
 *   n'est pas un navigateur : il n'est pas vecteur de CSRF.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (origin !== null) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return false; // "null" ou valeur mal formee
    }
    const host = headers.get("x-forwarded-host") ?? headers.get("host");
    return host !== null && originHost === host.split(",")[0].trim();
  }
  const site = headers.get("sec-fetch-site");
  return site === null || site === "same-origin" || site === "none";
}

/** Vrai si la requete peut modifier des donnees ET vient d'une autre origine. */
export function isCrossOriginMutation(request: Request): boolean {
  return !SAFE_METHODS.has(request.method.toUpperCase()) && !isSameOrigin(request.headers);
}

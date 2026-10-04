import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirections des anciennes URL qui ne different de la nouvelle que par la
 * casse (/Feed -> /feed, /Activity -> /activity).
 *
 * Ces deux cas ne peuvent pas passer par `redirects()` dans next.config.ts :
 * le matcher y est insensible a la casse, donc /feed re-matche la regle /Feed
 * et la redirection boucle a l'infini. Ici la comparaison est explicite, donc
 * seule une URL contenant vraiment une majuscule est redirigee.
 */
const CASE_ONLY_REDIRECTS = new Set(["/Feed", "/Activity"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (CASE_ONLY_REDIRECTS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Feed", "/Activity"],
};

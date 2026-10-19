import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES, LOCALE_COOKIE, isLocale, negotiateLocale } from "@/i18n/config";

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

/**
 * Internationalisation (guide i18n de Next.js) : toute page vit sous
 * /{langue}. Une URL sans langue est redirigee vers la langue choisie par le
 * visiteur (cookie NEXT_LOCALE), sinon vers celle de son navigateur
 * (Accept-Language), sinon vers le francais.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (CASE_ONLY_REDIRECTS.has(pathname)) {
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  const first = pathname.split("/")[1];
  if (LOCALES.some((locale) => locale === first)) return NextResponse.next();

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved) ? saved : negotiateLocale(request.headers.get("accept-language"));
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Tout sauf l'API, les fichiers internes de Next.js et les fichiers statiques
  // (chemins avec une extension : images, favicon…).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

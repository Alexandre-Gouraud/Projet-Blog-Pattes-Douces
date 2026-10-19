"use client";

import NextLink from "next/link";
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation";
import { type ComponentProps, useMemo } from "react";
import { LOCALE_COOKIE, type Locale, isLocale } from "./config";
import { useI18n } from "./I18nProvider";

/**
 * Navigation localisee : les composants manipulent des chemins sans langue
 * (ROUTES.feed = "/feed") et ces helpers ajoutent la langue courante
 * (/fr/feed). Une seule source de verite pour les URL, dans lib/routes.ts.
 */
export function localizePath(locale: Locale, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Retire le segment de langue d'un chemin : /ar/feed → /feed. */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  return isLocale(first) ? `/${rest.join("/")}` : pathname;
}

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string };

/** <Link> de Next.js dont le href interne recoit la langue courante. */
export function Link({ href, ...props }: LinkProps) {
  const { locale } = useI18n();
  return <NextLink href={localizePath(locale, href)} {...props} />;
}

/** Chemin courant sans la langue, pour comparer avec ROUTES. */
export function usePathname(): string {
  return stripLocale(useNextPathname());
}

/** Routeur dont push et replace ajoutent la langue courante. */
export function useRouter() {
  const router = useNextRouter();
  const { locale } = useI18n();
  return useMemo(
    () => ({
      ...router,
      push: (path: string) => router.push(localizePath(locale, path)),
      replace: (path: string) => router.replace(localizePath(locale, path)),
    }),
    [router, locale],
  );
}

/**
 * Change de langue en restant sur la meme page, et memorise le choix pour les
 * prochaines visites sans langue dans l'URL (voir src/proxy.ts).
 */
export function useSwitchLocale() {
  const router = useNextRouter();
  const pathname = usePathname();
  return (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.push(`${localizePath(next, pathname)}${window.location.search}${window.location.hash}`);
  };
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHydrated, useIsLoggedIn } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

/**
 * Page reservee aux membres (DESIGN.md §10) : un visiteur est redirige vers
 * la connexion, qui affiche « Connectez-vous pour acceder a cette page » puis
 * le ramene ici. La session vit dans le localStorage : on attend
 * l'hydratation pour la lire avant de decider.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const loggedIn = useIsLoggedIn();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !loggedIn) router.replace(ROUTES.loginRequired(pathname));
  }, [hydrated, loggedIn, pathname, router]);

  return hydrated && loggedIn ? children : null;
}

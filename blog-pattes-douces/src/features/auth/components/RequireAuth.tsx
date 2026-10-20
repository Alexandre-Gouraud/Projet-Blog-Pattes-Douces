"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useIsLoggedIn, useSessionReady } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

/**
 * Page reservee aux membres (DESIGN.md §10) : un visiteur est redirige vers
 * la connexion, qui affiche « Connectez-vous pour acceder a cette page » puis
 * le ramene ici. On attend la reponse de /api/auth/me (session serveur)
 * avant de decider, pour ne pas rediriger un membre deja connecte.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const ready = useSessionReady();
  const loggedIn = useIsLoggedIn();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !loggedIn) router.replace(ROUTES.loginRequired(pathname));
  }, [ready, loggedIn, pathname, router]);

  return ready && loggedIn ? children : null;
}

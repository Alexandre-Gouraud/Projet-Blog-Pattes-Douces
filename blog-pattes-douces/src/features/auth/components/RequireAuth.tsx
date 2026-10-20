"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/EmptyState";
import { useI18n } from "@/i18n/I18nProvider";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  justSignedOutOnPurpose,
  refreshSession,
  useIsLoggedIn,
  useSessionReady,
  useSessionUnknown,
} from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

/**
 * Page reservee aux membres (DESIGN.md §10) : un visiteur est redirige vers
 * la connexion, qui affiche « Connectez-vous pour acceder a cette page » puis
 * le ramene ici. On attend la reponse de /api/auth/me (session serveur)
 * avant de decider, pour ne pas rediriger un membre deja connecte.
 *
 * Deux cas ne redirigent pas : une deconnexion voulue (l'appelant navigue
 * lui-meme vers le fil) et une session inconnue (serveur injoignable) ou l'on
 * propose de reessayer plutot que de renvoyer un membre vers la connexion.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const ready = useSessionReady();
  const unknown = useSessionUnknown();
  const loggedIn = useIsLoggedIn();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    if (ready && !unknown && !loggedIn && !justSignedOutOnPurpose()) {
      router.replace(ROUTES.loginRequired(pathname));
    }
  }, [ready, unknown, loggedIn, pathname, router]);

  if (ready && unknown) {
    return <ErrorState message={t.common.loadError} retryLabel={t.common.retry} onRetry={() => void refreshSession()} />;
  }
  return ready && loggedIn ? children : null;
}

"use client";

import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/I18nProvider";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/api-client";
import { clearSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

/** Deconnexion : detruit la session serveur, confirme par un message et revient au fil. */
export function useLogout() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();

  return async () => {
    try {
      await logout();
    } catch {
      // La session serveur existe encore : ne pas afficher « deconnecte ».
      toast(t.shell.logoutFailed);
      return;
    }
    clearSession();
    toast(t.shell.loggedOut);
    router.push(ROUTES.feed);
  };
}

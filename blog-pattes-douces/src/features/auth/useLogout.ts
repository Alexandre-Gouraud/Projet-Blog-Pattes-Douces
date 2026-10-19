"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/I18nProvider";
import { clearSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

/** Deconnexion : vide la session, confirme par un message et revient au fil. */
export function useLogout() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();

  return () => {
    clearSession();
    toast(t.loggedOut);
    router.push(ROUTES.feed);
  };
}

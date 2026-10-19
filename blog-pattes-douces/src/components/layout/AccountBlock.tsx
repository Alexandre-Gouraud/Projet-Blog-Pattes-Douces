"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { speciesLabel } from "@/features/articles/species";
import { useLogout } from "@/features/auth/useLogout";
import { useI18n } from "@/i18n/I18nProvider";
import { Link } from "@/i18n/navigation";
import { usePseudo, useSpecies, useUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

/**
 * Bloc compte (barre laterale et tiroir) : avatar, pseudo, espece et « Se
 * deconnecter » pour un membre ; « Se connecter » et « Creer un compte » pour
 * un visiteur.
 */
export function AccountBlock({ variant, onNavigate }: { variant: "sidebar" | "drawer"; onNavigate?: () => void }) {
  const { t } = useI18n();
  const pseudo = usePseudo();
  const userId = useUserId();
  const espece = useSpecies();
  const logout = useLogout();
  const size = variant === "drawer" ? "lg" : "md";

  if (pseudo) {
    return (
      <>
        {variant === "sidebar" && (
          <div className="flex items-center gap-2.5 px-2">
            <Avatar name={pseudo} seed={userId ?? pseudo} />
            <span className="flex min-w-0 flex-col leading-[1.3]">
              <span className="truncate font-semibold">{pseudo}</span>
              <span className="text-sm text-ink2">{speciesLabel(t, { espece })}</span>
            </span>
          </div>
        )}
        <Button
          variant="secondary"
          size={size}
          onClick={() => {
            onNavigate?.();
            logout();
          }}
        >
          {t.shell.logout}
        </Button>
      </>
    );
  }

  return (
    <>
      <ButtonLink href={ROUTES.login} size={size} onClick={onNavigate}>
        {t.shell.login}
      </ButtonLink>
      {variant === "sidebar" ? (
        <Link
          href={ROUTES.register}
          className="flex min-h-11 items-center justify-center text-[15px] font-semibold text-link"
        >
          {t.shell.createAccount}
        </Link>
      ) : (
        <ButtonLink href={ROUTES.register} variant="secondary" size={size} onClick={onNavigate}>
          {t.shell.createAccount}
        </ButtonLink>
      )}
    </>
  );
}

/** Lien avatar vers le profil (barres superieures). */
export function ProfileLink() {
  const { t } = useI18n();
  const pseudo = usePseudo();
  const userId = useUserId();
  if (!pseudo) return null;

  return (
    <Link href={ROUTES.profile} className="grid size-11 place-items-center rounded-full no-underline">
      <Avatar name={pseudo} seed={userId ?? pseudo} size={36} />
      <span className="sr-only">{t.shell.myProfile}</span>
    </Link>
  );
}

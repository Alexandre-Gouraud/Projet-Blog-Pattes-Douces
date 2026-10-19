"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cardClass } from "@/components/ui/PageTitle";
import { useI18n } from "@/i18n/I18nProvider";
import { ROUTES } from "@/lib/routes";

/**
 * Bandeau d'accueil des visiteurs. Il precede le h1 « Articles recents » :
 * son titre n'est donc pas un intitule de niveau 2, pour garder une
 * hierarchie h1 → h2 sans saut (RGAA 9.1) ; la region porte ce titre.
 */
export function VisitorBanner() {
  const { t } = useI18n();
  return (
    <section aria-label={t.feed.welcomeTitle} className={`${cardClass} flex flex-wrap items-center gap-6 p-6`}>
      <Logo size={112} />
      <div className="flex flex-[1_1_280px] flex-col gap-3">
        <p className="m-0 text-2xl font-bold tracking-[-0.01em]">{t.feed.welcomeTitle}</p>
        <p className="m-0 text-ink2">{t.feed.welcomeText}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={ROUTES.register}>{t.feed.createMyAccount}</ButtonLink>
          <ButtonLink href={ROUTES.login} variant="secondary">
            {t.shell.login}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

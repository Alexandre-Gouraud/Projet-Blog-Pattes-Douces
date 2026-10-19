"use client";

import Link from "next/link";
import { BurgerIcon, CloseIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/i18n/I18nProvider";
import { useIsLoggedIn } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import { ProfileLink } from "./AccountBlock";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SIDEBAR_ID } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Bouton burger : rotation de 180° et passage burger ↔ croix (DESIGN.md §8).
 * Son libelle alterne entre « Ouvrir le menu » et « Fermer le menu ».
 */
export function BurgerButton({
  open,
  controls,
  onClick,
  ref,
}: {
  open: boolean;
  controls: string;
  onClick: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  const { t } = useI18n();
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-[10px] text-ink hover:bg-surface"
    >
      <span
        aria-hidden="true"
        className={`grid place-items-center transition-transform duration-[400ms] ease-bounce ${open ? "rotate-180" : ""}`}
      >
        {open ? <CloseIcon /> : <BurgerIcon />}
      </span>
      <span className="sr-only">{open ? t.closeMenu : t.openMenu}</span>
    </button>
  );
}

function HomeLink() {
  return (
    <Link href={ROUTES.feed} className="flex min-w-0 items-center gap-2.5 text-ink no-underline hover:text-ink">
      <Logo size={36} />
      <span className="truncate text-[17px] font-bold">Pattes Douces</span>
    </Link>
  );
}

/**
 * Barre superieure desktop (≥ 860 px), collante. Quand la barre laterale est
 * repliee, elle reprend logo, theme, langue et profil (DESIGN.md §9.2).
 */
export function TopBar({ sidebarOpen, onToggleSidebar }: { sidebarOpen: boolean; onToggleSidebar: () => void }) {
  const { t } = useI18n();
  const loggedIn = useIsLoggedIn();

  return (
    <header className="sticky top-0 z-20 hidden min-h-[60px] items-center gap-3 border-b border-line bg-app px-4 py-2 desk:flex">
      <BurgerButton open={sidebarOpen} controls={SIDEBAR_ID} onClick={onToggleSidebar} />
      {!sidebarOpen && (
        <>
          <HomeLink />
          <div className="ms-auto flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher menuId="menu-langue-haut" compact />
            {loggedIn ? <ProfileLink /> : <ButtonLink href={ROUTES.login}>{t.login}</ButtonLink>}
          </div>
        </>
      )}
    </header>
  );
}

/** Barre superieure mobile (< 860 px) : burger, logo, theme, langue, avatar. */
export function MobileHeader({
  drawerOpen,
  onOpenDrawer,
  burgerRef,
}: {
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  burgerRef: React.Ref<HTMLButtonElement>;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-1 border-b border-line bg-app px-3 py-2 desk:hidden">
      <BurgerButton ref={burgerRef} open={drawerOpen} controls="tiroir" onClick={onOpenDrawer} />
      <HomeLink />
      <div className="ms-auto flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher menuId="menu-langue-mobile" compact />
        <ProfileLink />
      </div>
    </header>
  );
}

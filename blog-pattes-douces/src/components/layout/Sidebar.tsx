"use client";

import { Logo } from "@/components/ui/Logo";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/routes";
import { AccountBlock } from "./AccountBlock";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export const SIDEBAR_ID = "barre-laterale";

/**
 * Barre laterale desktop (DESIGN.md §9.2) : collante, pleine hauteur,
 * repliable depuis le burger de la barre superieure. Repliee, elle reste dans
 * le DOM (masquee) pour que aria-controls designe toujours un element.
 */
export function Sidebar({ open }: { open: boolean }) {
  return (
    <aside
      id={SIDEBAR_ID}
      hidden={!open}
      className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col overflow-y-auto border-e border-line bg-app px-4 py-5 desk:flex"
    >
      <Link href={ROUTES.feed} className="flex items-center gap-3 px-2 pt-1 pb-5 text-ink no-underline hover:text-ink">
        <Logo size={44} priority />
        <span className="text-[19px] font-bold tracking-[-0.01em]">Pattes Douces</span>
      </Link>
      <NavLinks variant="sidebar" />
      <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher menuId="menu-langue-laterale" />
        </div>
        <AccountBlock variant="sidebar" />
      </div>
    </aside>
  );
}

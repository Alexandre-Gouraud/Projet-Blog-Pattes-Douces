"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import Footer from "./Footer";
import { MobileDrawer } from "./MobileDrawer";
import { Sidebar } from "./Sidebar";
import { MobileHeader, TopBar } from "./TopBar";

/**
 * Shell unique de toutes les pages, accueil et 404 compris (DESIGN.md §6) :
 * lien d'evitement, barre laterale repliable (≥ 860 px) ou tiroir (mobile),
 * barre superieure, <main id="contenu"> et pied de page.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);

  // Apres chaque navigation, le focus va sur <main> (RGAA 12.x) : le lecteur
  // d'ecran reprend la lecture au debut du nouveau contenu.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  // Le tiroir n'existe que sous 860 px : s'il reste ouvert quand la fenetre
  // s'elargit, le <dialog> modal (masque) rendrait toute la page inerte.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 53.75rem)");
    const onChange = () => {
      if (desktop.matches) setDrawerOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    burgerRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col desk:flex-row">
      <a
        href="#contenu"
        className="absolute start-3 -top-20 z-[100] rounded-[10px] bg-ink px-[18px] py-3 font-semibold text-app no-underline focus:top-3 focus:text-app"
      >
        {t.skip}
      </a>

      <Sidebar open={sidebarOpen} />
      <MobileHeader drawerOpen={drawerOpen} onOpenDrawer={() => setDrawerOpen(true)} burgerRef={burgerRef} />
      <MobileDrawer open={drawerOpen} onClose={closeDrawer} onNavigate={() => setDrawerOpen(false)} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main
          ref={mainRef}
          id="contenu"
          tabIndex={-1}
          className="flex-1 bg-grad px-4 pt-6 pb-14 desk:px-12 desk:pt-10 desk:pb-16"
        >
          <div className="mx-auto flex max-w-[960px] flex-col gap-6">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

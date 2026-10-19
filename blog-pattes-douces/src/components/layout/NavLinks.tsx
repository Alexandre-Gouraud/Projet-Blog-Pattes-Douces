"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, ChartIcon, DocumentIcon, HomeIcon, UserIcon } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { ROUTES } from "@/lib/routes";

const ITEMS = [
  { key: "feed", href: ROUTES.feed, Icon: HomeIcon },
  { key: "profile", href: ROUTES.profile, Icon: UserIcon },
  { key: "mine", href: ROUTES.myArticles, Icon: DocumentIcon },
  { key: "activity", href: ROUTES.activity, Icon: BookmarkIcon },
  { key: "stats", href: ROUTES.dashboard, Icon: ChartIcon },
] as const;

type NavKey = (typeof ITEMS)[number]["key"];

/** Entree de navigation active pour le chemin courant (aria-current="page"). */
function activeKey(pathname: string): NavKey | null {
  if (pathname === ROUTES.home || pathname === ROUTES.feed) return "feed";
  if (pathname === ROUTES.newArticle || pathname === ROUTES.myArticles) return "mine";
  if (pathname.startsWith(`${ROUTES.articles}/`)) return "feed";
  if (pathname === ROUTES.profile) return "profile";
  if (pathname === ROUTES.activity || pathname === ROUTES.comments) return "activity";
  if (pathname === ROUTES.dashboard) return "stats";
  return null;
}

/**
 * Navigation principale (DESIGN.md §9.2) en liste. Les pages reservees aux
 * membres restent listees pour un visiteur : elles le redirigent vers la
 * connexion.
 */
export function NavLinks({ variant, onNavigate }: { variant: "sidebar" | "drawer"; onNavigate?: () => void }) {
  const { t } = useI18n();
  const active = activeKey(usePathname());

  return (
    <nav aria-label={t.mainNav}>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {ITEMS.map(({ key, href, Icon }) => {
          const current = key === active;
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-[10px] text-ink no-underline hover:bg-surface hover:text-ink ${
                  variant === "sidebar" ? "min-h-11 px-3 text-[15px]" : "min-h-12 px-3.5 text-base"
                } ${current ? "bg-surface font-[650]" : "font-medium"}`}
              >
                {variant === "sidebar" && <Icon size={22} className="shrink-0 text-icon" />}
                <span>{t.nav[key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

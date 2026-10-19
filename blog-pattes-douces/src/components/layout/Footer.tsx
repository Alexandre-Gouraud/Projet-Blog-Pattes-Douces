"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { ROUTES } from "@/lib/routes";

/**
 * Pied de page (DESIGN.md §9.12). Contact et Accessibilite restent au meme
 * endroit sur toutes les pages (WCAG 3.2.6) ; la mention de l'etat de
 * conformite mene a la declaration d'accessibilite.
 */
export default function Footer() {
  const { t } = useI18n();
  const links = [
    { href: ROUTES.about, label: t.about },
    { href: ROUTES.contact, label: t.contact },
    { href: ROUTES.privacy, label: t.privacy },
    { href: ROUTES.accessibility, label: t.a11y },
  ];

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-6 py-5 text-[15px]">
      <p className="m-0 text-ink2">{t.copyright}</p>
      <nav aria-label={t.footerNav}>
        <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-flex min-h-11 items-center text-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}

"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/routes";

const linkClass = "inline-flex min-h-11 items-center text-link";

/**
 * Pied de page (DESIGN.md §9.12). Contact et Accessibilite restent au meme
 * endroit sur toutes les pages (WCAG 3.2.6). Aucun etat de conformite n'est
 * affiche : le lien « Accessibilite » mene a la declaration.
 */
export default function Footer() {
  const { t } = useI18n();
  const links = [
    { href: ROUTES.about, label: t.shell.footer.about },
    { href: ROUTES.contact, label: t.shell.footer.contact },
    { href: ROUTES.privacy, label: t.shell.footer.privacy },
    { href: ROUTES.accessibility, label: t.shell.footer.accessibility },
  ];

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-6 py-5 text-[15px]">
      <p className="m-0 text-ink2">{t.shell.copyright}</p>
      <nav aria-label={t.shell.footerNav}>
        <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClass}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}

import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PageTitle, cardClass } from "@/components/ui/PageTitle";
import { getDictionary, pageTitle } from "@/i18n/dictionaries";
import { ROUTES } from "@/lib/routes";

// Le layout racine est app/[lang]/layout.tsx : ce not-found est donc la 404
// racine, la seule a pouvoir exporter des metadonnees (un seul <title> traduit).
export const generateMetadata = pageTitle("notFound");

/** Page 404 integree au shell (DESIGN.md §9.13). */

export default async function NotFound() {
  const t = await getDictionary();
  return (
    <div className={`${cardClass} mx-auto my-12 flex w-full max-w-[520px] flex-col items-center gap-3.5 px-7 py-9 text-center`}>
      <Logo size={96} />
      <PageTitle>{t.titles.notFound}</PageTitle>
      <p className="m-0 text-ink2">{t.errors.notFoundText}</p>
      <ButtonLink href={ROUTES.feed} size="lg">
        {t.errors.backFeed}
      </ButtonLink>
    </div>
  );
}

import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PageTitle, cardClass } from "@/components/ui/PageTitle";
import { getDictionary } from "@/i18n/dictionaries";
import { ROUTES } from "@/lib/routes";

/**
 * Page 404 integree au shell (DESIGN.md §9.13). Seul un not-found a la racine
 * de app/ peut exporter des metadonnees : le titre du document est donc rendu
 * ici, React le place dans <head>.
 */
export default async function NotFound() {
  const t = await getDictionary();
  return (
    <div className={`${cardClass} mx-auto my-12 flex w-full max-w-[520px] flex-col items-center gap-3.5 px-7 py-9 text-center`}>
      <title>{`${t.titles.notFound} – Pattes Douces`}</title>
      <Logo size={96} />
      <PageTitle>{t.titles.notFound}</PageTitle>
      <p className="m-0 text-ink2">{t.errors.notFoundText}</p>
      <ButtonLink href={ROUTES.feed} size="lg">
        {t.errors.backFeed}
      </ButtonLink>
    </div>
  );
}

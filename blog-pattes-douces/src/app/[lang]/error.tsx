"use client"; // Les error boundaries doivent etre des Client Components

import { useEffect } from "react";
import { AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { PageTitle, cardClass } from "@/components/ui/PageTitle";
import { useI18n } from "@/i18n/I18nProvider";

/** Erreur inattendue d'une page : message explicite, sans detail technique, et reessai. */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`${cardClass} mx-auto my-12 flex w-full max-w-[520px] flex-col items-center gap-3.5 px-7 py-9 text-center`}>
      <title>{`${t.titles.error} – Pattes Douces`}</title>
      <AlertIcon size={40} className="text-danger" />
      <PageTitle>{t.errors.errorTitle}</PageTitle>
      <p className="m-0 text-ink2">{t.errors.errorText}</p>
      <Button size="lg" onClick={() => retry()}>
        {t.common.retry}
      </Button>
    </div>
  );
}

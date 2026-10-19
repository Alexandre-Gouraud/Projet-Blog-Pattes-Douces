import type { ReactNode } from "react";
import { PageTitle, cardClass } from "@/components/ui/PageTitle";

/** Mise en page des pages d'information : titre, puis une carte de texte. */
export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageTitle>{title}</PageTitle>
      <div className={`${cardClass} flex max-w-[72ch] flex-col gap-4 p-5 desk:p-8`}>{children}</div>
    </>
  );
}

export function InfoSection({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h2 id={id} className="m-0 text-[22px] font-bold">
        {heading}
      </h2>
      {children}
    </section>
  );
}

/** Lien externe : le texte dit ou il mene (RGAA 6.1). */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="inline-flex min-h-11 items-center font-semibold text-link" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export const REPOSITORY_URL = "https://github.com/Alexandre-git-SDV/Projet-Blog-Pattes-Douces";

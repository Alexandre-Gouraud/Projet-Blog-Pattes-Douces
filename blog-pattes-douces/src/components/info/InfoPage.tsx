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

/** Section titree ; `level` 3 pour une sous-section (hierarchie sans saut, RGAA 9.1). */
export function InfoSection({
  id,
  heading,
  level = 2,
  children,
}: {
  id: string;
  heading: string;
  level?: 2 | 3;
  children: ReactNode;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <Heading id={id} className={`m-0 font-bold ${level === 2 ? "text-[22px]" : "text-lg"}`}>
        {heading}
      </Heading>
      {children}
    </section>
  );
}

/** Liste a puces simple d'une page d'information. */
export function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex flex-col gap-1.5 ps-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
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

export const REPOSITORY_URL = "https://github.com/Alexandre-Gouraud/Projet-Blog-Pattes-Douces";

/** Titre de page : un seul h1 par vue, 26 px sur mobile et 32 px sur desktop. */
export function PageTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={`m-0 text-[26px] leading-[1.15] font-bold tracking-[-0.02em] desk:text-[32px] ${className}`}>
      {children}
    </h1>
  );
}

/** Carte : surface, rayon 16 px, ombre md (DESIGN.md §5). */
export const cardClass = "rounded-2xl bg-surface shadow-md";

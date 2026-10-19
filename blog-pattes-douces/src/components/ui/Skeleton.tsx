/**
 * Squelettes de chargement statiques (DESIGN.md §10) : aria-busy et texte
 * masque pour les lecteurs d'ecran, formes decoratives en --sk1 / --sk2.
 */
function Bar({ className }: { className: string }) {
  return <span aria-hidden="true" className={`block rounded-md ${className}`} />;
}

export function Loading({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Squelette d'une carte article. */
export function CardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3 rounded-2xl bg-surface p-[22px] shadow-sm">
      <div className="flex items-center gap-3">
        <span className="size-10 rounded-full bg-sk1" />
        <Bar className="h-3.5 w-40 bg-sk1" />
      </div>
      <Bar className="h-5 w-3/5 bg-sk1" />
      <Bar className="h-3.5 w-full bg-sk2" />
      <Bar className="h-3.5 w-4/5 bg-sk2" />
    </div>
  );
}

/** Squelette du detail d'un article. */
export function ArticleSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3.5 rounded-2xl bg-surface p-8">
      <Bar className="h-[30px] w-[70%] rounded-lg bg-sk1" />
      <Bar className="h-3.5 w-[30%] bg-sk2" />
      <Bar className="h-[90px] w-full rounded-lg bg-sk2" />
    </div>
  );
}

/** Squelette d'une tuile ou d'un bloc de statistiques. */
export function BlockSkeleton({ height = 96 }: { height?: number }) {
  return <span aria-hidden="true" className="block rounded-2xl bg-surface" style={{ height }} />;
}

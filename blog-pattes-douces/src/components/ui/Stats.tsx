/**
 * Tuiles et graphiques de statistiques (DESIGN.md §9.10). Chaque graphique a
 * une alternative chiffree ; le tableau « Detail par article » reste
 * l'alternative textuelle complete.
 */

/** Tuile : valeur en grand ; le libelle est avant la valeur dans le DOM. */
export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex flex-col-reverse gap-0.5 rounded-2xl bg-surface px-5 py-[18px] shadow-sm">
      <span className="text-[15px] text-ink2">{label}</span>
      <span className="text-[32px] leading-[1.1] font-bold">{value}</span>
    </li>
  );
}

export function StatTiles({ tiles }: { tiles: { label: string; value: number }[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 p-0">
      {tiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </ul>
  );
}

/** Anneau j'aime / je n'aime pas, avec sa legende chiffree. */
export function Donut({
  likes,
  dislikes,
  alt,
  totalLabel,
  likeLegend,
  dislikeLegend,
}: {
  likes: number;
  dislikes: number;
  alt: string;
  totalLabel: string;
  likeLegend: string;
  dislikeLegend: string;
}) {
  const total = likes + dislikes;
  const likePct = total ? Math.round((likes / total) * 100) : 0;
  const background = total
    ? `conic-gradient(var(--color-chart-like) 0 ${likePct}%, var(--color-chart-dislike) ${likePct}% 100%)`
    : "var(--sk1)";

  return (
    <>
      <div role="img" aria-label={alt} className="grid size-[180px] place-items-center rounded-full" style={{ background }}>
        <div aria-hidden="true" className="flex size-[120px] flex-col items-center justify-center rounded-full bg-surface">
          <span className="text-sm text-ink2">{totalLabel}</span>
          <span className="text-[30px] leading-[1.1] font-bold">{total}</span>
        </div>
      </div>
      <ul className="m-0 flex list-none flex-wrap justify-center gap-4 p-0 text-[15px]">
        {/* Formes differentes (carre / rond) : la legende ne repose pas que sur la couleur. */}
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-3.5 rounded-[4px] bg-chart-like" />
          {likeLegend}
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-3.5 rounded-full bg-chart-dislike" />
          {dislikeLegend}
        </li>
      </ul>
    </>
  );
}

/** Barres horizontales, valeur ecrite a cote de chaque barre. */
export function Bars({ bars }: { bars: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...bars.map((bar) => bar.value));
  return (
    <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
      {bars.map((bar) => (
        <li key={bar.label} className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-2.5 text-[15px]">
          <span>{bar.label}</span>
          <span aria-hidden="true" className="block h-3 overflow-hidden rounded-full bg-sk1">
            <span
              className="block h-full rounded-full"
              style={{ width: `${Math.round((bar.value / max) * 100)}%`, background: bar.color }}
            />
          </span>
          <span className="min-w-9 text-end font-bold">{bar.value}</span>
        </li>
      ))}
    </ul>
  );
}

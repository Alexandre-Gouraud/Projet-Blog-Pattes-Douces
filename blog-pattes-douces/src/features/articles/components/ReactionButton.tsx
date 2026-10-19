import type { ReactNode } from "react";

/**
 * Pastille J'aime / Je n'aime pas (DESIGN.md §9.6). L'etat passe par
 * aria-pressed et par le contour et le fond, pas seulement par la couleur.
 * En version compacte, seul le nombre est visible et le nom accessible
 * « J'aime (3) » le contient (WCAG 2.5.3).
 */
export function ReactionButton({
  pressed,
  icon,
  count,
  label,
  accessibleLabel,
  onClick,
}: {
  pressed: boolean;
  icon: ReactNode;
  count: number;
  /** Libelle visible (version complete, detail d'article). */
  label?: string;
  /** Nom accessible de la version compacte. */
  accessibleLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label ? undefined : accessibleLabel}
      onClick={onClick}
      className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-[1.5px] px-3 font-semibold text-ink ${
        label ? "gap-2 px-4" : "text-sm"
      } ${pressed ? "border-brand bg-tint" : "border-line-strong bg-surface hover:bg-tint"}`}
    >
      {icon}
      {label ? `${label} · ${count}` : count}
    </button>
  );
}

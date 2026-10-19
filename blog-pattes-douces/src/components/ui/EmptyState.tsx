import type { ReactNode } from "react";
import { AlertIcon } from "@/components/icons";
import { Button } from "./Button";
import { Logo } from "./Logo";

/**
 * Etat vide (DESIGN.md §10) : bloc --cream, phrase chaleureuse et action
 * primaire facultative.
 */
export function EmptyState({
  title,
  text,
  action,
  logo = false,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  logo?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-cream p-8 text-center text-ink">
      {logo && <Logo size={80} />}
      <p className="m-0 text-lg font-semibold">{title}</p>
      {text && <p className="m-0 text-ink2">{text}</p>}
      {action}
    </div>
  );
}

/** Erreur de chargement : message explicite et bouton pour reessayer. */
export function ErrorState({ message, retryLabel, onRetry }: { message: string; retryLabel: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-2xl bg-danger-bg p-5 font-semibold text-danger-ink"
    >
      <AlertIcon className="shrink-0" />
      <p className="m-0 min-w-0 flex-1 basis-60">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}

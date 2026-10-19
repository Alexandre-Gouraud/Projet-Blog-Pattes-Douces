"use client";

import { useEffect, useId, useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "./Button";

/**
 * Dialogue de confirmation d'une suppression (DESIGN.md §9.11). Il s'appuie
 * sur <dialog> ouvert avec showModal() : le reste de la page devient inerte
 * (focus capture), Echap declenche l'annulation. Le focus va sur « Annuler »
 * a l'ouverture et revient sur le declencheur a la fermeture.
 */
type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const trigger = document.activeElement as HTMLElement | null;
    dialog.showModal();
    cancelRef.current?.focus();
    return () => {
      dialog.close();
      // Le declencheur a pu disparaitre (article supprime) : le focus va alors sur <main>.
      if (trigger?.isConnected) trigger.focus();
      else document.getElementById("contenu")?.focus();
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      // Echap : le navigateur emet « cancel » ; la fermeture passe par l'etat du parent.
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[calc(100%-32px)] max-w-[440px] rounded-2xl bg-surface p-6 text-ink shadow-lg backdrop:bg-[rgba(31,20,11,.5)]"
    >
      <div className="flex flex-col gap-3.5">
        <h2 id={titleId} className="m-0 text-[22px] font-bold">
          {title}
        </h2>
        <p id={descriptionId} className="m-0 text-ink2">
          {description}
        </p>
        <div className="flex flex-wrap justify-end gap-2.5 pt-1.5">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            {t.cancel}
          </Button>
          <Button variant="danger-solid" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

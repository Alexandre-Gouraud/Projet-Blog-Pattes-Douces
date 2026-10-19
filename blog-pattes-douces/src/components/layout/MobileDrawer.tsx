"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { AccountBlock } from "./AccountBlock";
import { NavLinks } from "./NavLinks";

/**
 * Tiroir de navigation mobile (DESIGN.md §9.3) : <dialog> modal, donc focus
 * capture et reste de la page inerte. A l'ouverture, le focus va sur « Fermer
 * le menu » ; Echap, ce bouton ou un clic sur le voile le ferment.
 */
export function MobileDrawer({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  /** Fermeture sans navigation : le focus revient au burger. */
  onClose: () => void;
  /** Fermeture par un lien : le focus ira sur le contenu de la nouvelle page. */
  onNavigate: () => void;
}) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    dialog.showModal();
    closeRef.current?.focus();
    return () => dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id="tiroir"
      aria-label={t.shell.menu}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // Un clic sur le voile (::backdrop) arrive sur le <dialog> lui-meme.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-y-0 start-0 m-0 h-full max-h-none w-[min(300px,85vw)] max-w-none bg-transparent p-0 text-ink backdrop:bg-[rgba(31,20,11,.45)] desk:hidden"
    >
      <div className="flex h-full flex-col overflow-auto bg-app px-4 pt-3 pb-5 shadow-lg">
        <div className="flex items-center justify-between pb-3">
          <span className="text-[17px] font-bold">Pattes Douces</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid size-11 cursor-pointer place-items-center rounded-[10px] text-ink hover:bg-surface"
          >
            <CloseIcon size={22} />
            <span className="sr-only">{t.shell.closeMenu}</span>
          </button>
        </div>
        <NavLinks variant="drawer" onNavigate={onNavigate} />
        <div className="mt-auto flex flex-col gap-2.5 pt-4">
          <AccountBlock variant="drawer" onNavigate={onNavigate} />
        </div>
      </div>
    </dialog>
  );
}

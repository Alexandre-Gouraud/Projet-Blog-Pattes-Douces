"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronIcon } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { LOCALES, LOCALE_INFO, type Locale } from "@/i18n/config";
import { DICTIONARIES } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/I18nProvider";

function Flag({ locale, large = false }: { locale: Locale; large?: boolean }) {
  // Drapeau decoratif : le nom de la langue est toujours ecrit (DESIGN.md §7).
  return (
    // eslint-disable-next-line @next/next/no-img-element -- petit SVG local, pas d'optimisation utile
    <img
      src={LOCALE_INFO[locale].flag}
      alt=""
      className={`block shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,.18)] ${
        large ? "h-[19px] w-7" : "h-4 w-6"
      }`}
    />
  );
}

/**
 * Selecteur de langue (DESIGN.md §9.4). Bouton : drapeau, nom de la langue
 * (version complete) et texte masque « Changer de langue ». Menu : chaque
 * langue ecrite dans sa langue avec l'attribut lang ; la langue active porte
 * aria-current. Fermeture par selection, Echap ou clic exterieur ; un message
 * de statut confirme le changement.
 */
export function LanguageSwitcher({ menuId, compact = false }: { menuId: string; compact?: boolean }) {
  const { locale, t, setLocale } = useI18n();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = LOCALE_INFO[locale];

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const pick = (next: Locale) => {
    setOpen(false);
    buttonRef.current?.focus();
    if (next === locale) return;
    setLocale(next);
    toast(DICTIONARIES[next].langChanged);
  };

  return (
    <div ref={rootRef} className={`relative flex items-center ${compact ? "" : "min-w-0 flex-1"}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-brand bg-surface text-[15px] font-semibold text-ink hover:bg-tint ${
          compact ? "w-11 shrink-0" : "w-full px-3"
        }`}
      >
        <Flag locale={locale} />
        {compact ? (
          <span className="sr-only">
            <span lang={locale}>{current.name}</span> – {t.changeLang}
          </span>
        ) : (
          <>
            <span lang={locale} className="flex-1 text-start">
              {current.name}
            </span>
            <ChevronIcon className={open ? "" : "rotate-180"} />
            <span className="sr-only"> – {t.changeLang}</span>
          </>
        )}
      </button>

      <ul
        id={menuId}
        hidden={!open}
        aria-label={t.chooseLang}
        className={`absolute end-0 z-50 m-0 flex w-[220px] list-none flex-col gap-0.5 rounded-xl border border-line bg-surface p-1.5 shadow-lg ${
          compact ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]"
        }`}
      >
        {LOCALES.map((code) => {
          const active = code === locale;
          return (
            <li key={code}>
              <button
                type="button"
                lang={code}
                aria-current={active ? "true" : undefined}
                onClick={() => pick(code)}
                className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 text-start text-[15px] text-ink hover:bg-tint ${
                  active ? "bg-tint font-[650]" : "font-medium"
                }`}
              >
                <Flag locale={code} large />
                <span className="flex-1">{LOCALE_INFO[code].name}</span>
                {active && <CheckIcon />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

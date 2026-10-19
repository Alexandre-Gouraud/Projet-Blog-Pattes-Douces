"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { setTheme, useTheme } from "@/theme/theme";

/**
 * Bouton de theme (DESIGN.md §9.5) : « Mode sombre » avec aria-pressed. Lune
 * en theme clair, soleil en theme sombre, avec une rotation de 360°. L'icone
 * et la rotation suivent data-theme en CSS : elles sont justes des le premier
 * affichage, avant meme l'hydratation.
 */
export function ThemeToggle() {
  const { t } = useI18n();
  const dark = useTheme() === "dark";

  return (
    <button
      type="button"
      aria-pressed={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-[10px] border-[1.5px] border-brand bg-surface text-ink hover:bg-tint"
    >
      <span
        aria-hidden="true"
        className="grid place-items-center transition-transform duration-500 ease-bounce in-data-[theme=dark]:rotate-[360deg]"
      >
        <MoonIcon className="in-data-[theme=dark]:hidden" />
        <SunIcon className="hidden in-data-[theme=dark]:block" />
      </span>
      <span className="sr-only">{t.darkMode}</span>
    </button>
  );
}

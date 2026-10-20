"use client";

import { TranslateIcon } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import type { ContentTranslation } from "./useContentTranslation";

/**
 * Commande « Traduire en … » d'un contenu de membre : un bouton qui bascule
 * entre traduction et original. Une zone role="status" annonce le chargement
 * du modele, la traduction en cours, le resultat (« Traduction automatique ·
 * langue d'origine : … ») et les erreurs (WCAG 4.1.3). Le modele commence a
 * se charger des le survol ou le focus du bouton.
 * `context` precise le contenu vise quand la commande est repetee (RGAA 6.1).
 */
export function TranslateControl({ translation, context }: { translation: ContentTranslation; context?: string }) {
  const { t, f } = useI18n();
  if (!translation.needed) return null;

  const languages = t.translation.languages;
  const loading = translation.status === "loading";
  const status =
    translation.status === "error"
      ? t.translation.failed
      : translation.progress !== null
        ? f(t.translation.downloading, { percent: translation.progress })
        : loading
          ? t.translation.translating
          : translation.showing
            ? f(t.translation.notice, { language: languages[translation.source] })
            : "";

  return (
    <div className="flex flex-wrap items-center gap-x-3">
      <button
        type="button"
        onClick={translation.toggle}
        onPointerEnter={translation.warm}
        onFocus={translation.warm}
        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] bg-transparent px-0 text-sm font-semibold text-link hover:text-ink"
      >
        <TranslateIcon />
        {translation.showing && !loading
          ? t.translation.showOriginal
          : f(t.translation.translateTo, { language: languages[translation.target] })}
        {context && <span className="sr-only"> – {context}</span>}
      </button>
      <p role="status" className={`m-0 text-sm ${translation.status === "error" ? "font-semibold text-danger" : "text-ink3"}`}>
        {status}
      </p>
    </div>
  );
}

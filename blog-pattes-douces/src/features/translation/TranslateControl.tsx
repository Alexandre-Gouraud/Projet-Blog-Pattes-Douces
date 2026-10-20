"use client";

import { TranslateIcon } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { externalTranslationUrl } from "./translator";
import type { ContentTranslation } from "./useContentTranslation";

/**
 * Commande « Traduire en … » d'un contenu de membre.
 *
 * - Traduction dans le navigateur : bouton qui bascule entre traduction et
 *   original. Une zone role="status" annonce le resultat (« Traduction
 *   automatique · langue d'origine : … »), le telechargement du modele et
 *   les erreurs (WCAG 4.1.3).
 * - Sinon, ou si la traduction du navigateur echoue (modele indisponible,
 *   limite atteinte...) : lien vers Google Traduction, qui signale
 *   l'ouverture d'un nouvel onglet (RGAA 13.2).
 * `context` precise le contenu vise quand la commande est repetee (RGAA 6.1).
 */
export function TranslateControl({
  translation,
  originalText,
  context,
}: {
  translation: ContentTranslation;
  /** Texte envoye a Google Traduction en repli. */
  originalText: string;
  context?: string;
}) {
  const { t, f } = useI18n();
  if (!translation.needed || !translation.mode) return null;

  const { source, target } = translation;
  const languages = t.translation.languages;
  const contextLabel = context ? <span className="sr-only"> – {context}</span> : null;
  const control =
    "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] text-sm font-semibold text-link hover:text-ink";

  const externalLink = (
    <a
      href={externalTranslationUrl(originalText, source, target)}
      target="_blank"
      rel="noopener noreferrer"
      className={control}
    >
      <TranslateIcon />
      {t.translation.external}
      <span className="sr-only"> {t.translation.newTab}</span>
      {contextLabel}
    </a>
  );

  if (translation.mode === "external") return <p className="m-0">{externalLink}</p>;

  const status =
    translation.status === "error"
      ? t.translation.failed
      : translation.progress !== null
        ? f(t.translation.downloading, { percent: translation.progress })
        : translation.status === "loading"
          ? t.translation.translating
          : translation.showing
            ? f(t.translation.notice, { language: languages[source] })
            : "";

  return (
    <div className="flex flex-wrap items-center gap-x-3">
      <button type="button" onClick={translation.toggle} className={`${control} bg-transparent px-0`}>
        <TranslateIcon />
        {translation.showing ? t.translation.showOriginal : f(t.translation.translateTo, { language: languages[target] })}
        {contextLabel}
      </button>
      <p role="status" className={`m-0 text-sm ${translation.status === "error" ? "font-semibold text-danger" : "text-ink3"}`}>
        {status}
      </p>
      {translation.status === "error" && externalLink}
    </div>
  );
}

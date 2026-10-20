"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { type TranslationMode, sourceLocale, translateTexts, translationMode } from "./translator";

type Result = { target: Locale; texts: string[] };

export type ContentTranslation = {
  /** false si le contenu est deja dans la langue de l'interface. */
  needed: boolean;
  /** null tant que la disponibilite de la traduction n'est pas connue. */
  mode: TranslationMode | null;
  source: Locale;
  target: Locale;
  status: "idle" | "loading" | "error";
  /** Avancement du telechargement du modele (0 a 100), sinon null. */
  progress: number | null;
  showing: boolean;
  /** Texte a afficher (traduit ou original) et sa langue. */
  text: (index: number) => string;
  lang: string;
  /** Traduit, ou bascule entre traduction et original. */
  toggle: () => void;
};

/**
 * Etat de la traduction d'un contenu de membre (titre et texte d'un article,
 * texte d'un commentaire) vers la langue de l'interface.
 */
export function useContentTranslation(texts: string[], langue: string | null | undefined): ContentTranslation {
  const { locale: target } = useI18n();
  const source = sourceLocale(langue);
  const needed = source !== target;
  const [mode, setMode] = useState<TranslationMode | null>(null);
  const [status, setStatus] = useState<ContentTranslation["status"]>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (!needed) return;
    let cancelled = false;
    translationMode(source, target).then((next) => !cancelled && setMode(next));
    return () => {
      cancelled = true;
    };
  }, [needed, source, target]);

  // Une traduction faite pour une autre langue d'interface n'est plus valable.
  const translated = result?.target === target ? result.texts : null;
  const visible = showing && translated !== null;

  const toggle = () => {
    if (translated) {
      setShowing((value) => !value);
      return;
    }
    setStatus("loading");
    translateTexts(texts, source, target, (loaded) => setProgress(Math.round(loaded * 100)))
      .then((output) => {
        setResult({ target, texts: output });
        setShowing(true);
        setStatus("idle");
      })
      .catch(() => setStatus("error"))
      .finally(() => setProgress(null));
  };

  return {
    needed,
    mode,
    source,
    target,
    status,
    progress,
    showing: visible,
    text: (index) => (visible ? translated[index] : texts[index]),
    lang: visible ? target : source,
    toggle,
  };
}

"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { sourceLocale, translateTexts, warmUp } from "./translator";

/** `done[i]` : le texte i est (au moins en partie) traduit. */
type Result = { target: Locale; texts: string[]; done: boolean[] };

export type ContentTranslation = {
  /** false si le contenu est deja dans la langue de l'interface. */
  needed: boolean;
  source: Locale;
  target: Locale;
  status: "idle" | "loading" | "error";
  /** Avancement du chargement du modele (0 a 100), sinon null. */
  progress: number | null;
  showing: boolean;
  /** Texte a afficher (traduit ou original) et sa langue, texte par texte. */
  text: (index: number) => string;
  lang: (index: number) => string;
  /** Prechauffe le modele (survol ou focus du bouton). */
  warm: () => void;
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
  const [status, setStatus] = useState<ContentTranslation["status"]>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [showing, setShowing] = useState(false);

  // Une traduction faite pour une autre langue d'interface n'est plus valable.
  const translated = result?.target === target ? result.texts : null;
  const visible = showing && translated !== null;

  const toggle = () => {
    if (status === "loading") return;
    if (translated) {
      setShowing((value) => !value);
      return;
    }
    setStatus("loading");
    // Les segments deja traduits s'affichent au fil du calcul ; la suite reste
    // dans sa version d'origine jusqu'a ce qu'elle soit traduite.
    const partial = [...texts];
    const started = texts.map(() => false);
    translateTexts(texts, source, target, {
      onProgress: (loaded) => setProgress(Math.round(loaded * 100)),
      onPartial: (index, text) => {
        partial[index] = text;
        started[index] = true;
        setResult({ target, texts: [...partial], done: [...started] });
        setShowing(true);
        setProgress(null);
      },
    })
      .then((output) => {
        setResult({ target, texts: output, done: output.map(() => true) });
        setShowing(true);
        setStatus("idle");
      })
      .catch(() => {
        setResult(null);
        setShowing(false);
        setStatus("error");
      })
      .finally(() => setProgress(null));
  };

  return {
    needed,
    source,
    target,
    status,
    progress,
    showing: visible,
    text: (index) => (visible ? translated[index] : texts[index]),
    // Un texte pas encore commence garde sa langue d'origine (RGAA 8.7).
    lang: (index) => (visible && result?.done[index] ? target : source),
    warm: () => {
      if (needed && !translated) warmUp(source, target);
    },
    toggle,
  };
}

"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./themeScript";

/**
 * Theme clair ou sombre (DESIGN.md §9.5). Le choix est memorise dans le
 * localStorage ; sans choix, on suit prefers-color-scheme. La source de verite
 * est l'attribut data-theme de <html>, pose avant le premier rendu par
 * THEME_SCRIPT (voir themeScript.ts et app/layout.tsx).
 */
export type Theme = "light" | "dark";

const CHANGE_EVENT = "pd-theme-change";

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Reapplique le theme memorise (ou systeme) sur <html>. */
export function applyTheme(theme: Theme = storedTheme() ?? systemTheme()): void {
  document.documentElement.setAttribute("data-theme", theme);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Stockage indisponible (navigation privee) : le choix vaut pour la session.
  }
  applyTheme(theme);
}

function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  // Sans choix memorise, le site suit les changements de preference du systeme.
  const onSystemChange = () => {
    if (!storedTheme()) applyTheme();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    media.removeEventListener("change", onSystemChange);
  };
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "light");
}

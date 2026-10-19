"use client";

import { useLayoutEffect } from "react";
import { applyTheme } from "./theme";

/**
 * En developpement, le double montage du mode strict remet <html> a ses seuls
 * attributs JSX et efface data-theme pose par le script inline : on le
 * reapplique avant l'affichage. Sans effet en production.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    applyTheme();
  }, []);

  return children;
}

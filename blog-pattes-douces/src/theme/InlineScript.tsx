"use client";

/**
 * Script inline execute pendant l'analyse du HTML, avant le premier rendu
 * (guide Next.js « Preventing flash before hydration »). Cote client, React
 * ne doit pas recreer un <script> executable : le type devient text/plain et
 * suppressHydrationWarning accepte la difference.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

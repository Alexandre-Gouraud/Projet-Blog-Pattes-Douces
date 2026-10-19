"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * Message temporaire (DESIGN.md §9.11) : role="status", annonce poliment,
 * affiche 4 s en bas au centre. Remplace les alert() natifs. La zone live
 * existe en permanence pour que les lecteurs d'ecran annoncent chaque message.
 * Il ne contient jamais d'action indispensable (WCAG 2.2.1).
 */
type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

const DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback<ShowToast>((text) => {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), DURATION);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 left-1/2 z-[60] max-w-[calc(100vw-32px)] -translate-x-1/2"
      >
        {message && (
          <p className="m-0 rounded-xl bg-ink px-5 py-3.5 font-semibold text-app shadow-lg">{message}</p>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast doit etre utilise sous <ToastProvider>.");
  return show;
}

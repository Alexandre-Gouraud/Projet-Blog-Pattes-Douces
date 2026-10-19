"use client";

import { useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/I18nProvider";
import { dislikeArticle, likeArticle } from "@/lib/api-client";
import { useUserId } from "@/lib/auth/session";
import type { Article } from "@/types";

export type ReactionType = "like" | "dislike";

/**
 * Bascule la reaction de l'utilisateur sur un article et renvoie l'article a
 * jour (ou null). Un visiteur recoit le message « Connectez-vous pour reagir »
 * (DESIGN.md §10).
 */
export function useReact() {
  const userId = useUserId();
  const toast = useToast();
  const { t } = useI18n();

  return useCallback(
    async <A extends Article>(article: A, type: ReactionType): Promise<A | null> => {
      if (!userId) {
        toast(t.reactLogin);
        return null;
      }
      try {
        const toggle = type === "like" ? likeArticle : dislikeArticle;
        const updated = await toggle(article.id, userId);
        // La reponse ne contient ni l'auteur ni les compteurs : on ne reprend que les reactions.
        return { ...article, reaction1: updated.reaction1, reaction2: updated.reaction2 };
      } catch {
        toast(t.reactError);
        return null;
      }
    },
    [userId, toast, t],
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchArticles, fetchCommentsOnAuthorArticles } from "@/lib/api-client";
import { useUserId } from "@/lib/auth/session";
import { ARTICLES_CHANGED_EVENT } from "@/features/articles/events";
import type { Article, Comment } from "@/types";

type Data = { articles: Article[]; comments: Comment[] };

/**
 * Articles de l'utilisateur connecte, commentaires recus sur ces articles et
 * totaux derives. Partage par le profil et les statistiques.
 */
export function useUserStats() {
  const userId = useUserId();
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        // Le filtrage (articles de l'utilisateur, commentaires recus sur ces
        // articles) est fait par l'API : rien d'inutile n'est telecharge.
        const [articles, comments] = await Promise.all([
          fetchArticles(userId),
          fetchCommentsOnAuthorArticles(userId),
        ]);
        if (!cancelled) setData({ articles, comments });
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    load();
    window.addEventListener(ARTICLES_CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(ARTICLES_CHANGED_EVENT, load);
    };
  }, [userId, attempt]);

  const articles = data?.articles ?? [];
  const views = articles.reduce((total, article) => total + article.vue.length, 0);
  const likes = articles.reduce((total, article) => total + article.reaction1.length, 0);
  const dislikes = articles.reduce((total, article) => total + article.reaction2.length, 0);

  return {
    loading: !data && !failed,
    failed,
    retry: () => {
      setFailed(false);
      setData(null);
      setAttempt((n) => n + 1);
    },
    articles,
    comments: data?.comments ?? [],
    views,
    likes,
    dislikes,
    reactions: likes + dislikes,
  };
}

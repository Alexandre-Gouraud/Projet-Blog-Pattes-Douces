"use client";

import { useEffect, useState } from "react";
import { fetchArticles, fetchComments } from "@/lib/api-client";
import { useUserId } from "@/lib/auth/session";
import { ARTICLES_CHANGED_EVENT } from "@/features/articles/events";
import type { Article, Comment } from "@/types";

/**
 * Articles de l'utilisateur connecte, commentaires recus sur ces articles et
 * totaux derives. Partage par StatsOverview et StatsChart.
 */
export function useUserStats() {
  const userId = useUserId();
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const [userArticles, allComments] = await Promise.all([fetchArticles(userId), fetchComments()]);
        if (cancelled) return;
        // Filtre sur les articles qui viennent d'etre charges, pas sur l'etat
        // precedent (qui est vide au premier rendu).
        const articleIds = new Set(userArticles.map((article) => article.id));
        setArticles(userArticles);
        setComments(allComments.filter((comment) => articleIds.has(comment.article_source?.id)));
      } catch (error) {
        console.error(error);
      }
    };

    load();
    window.addEventListener(ARTICLES_CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(ARTICLES_CHANGED_EVENT, load);
    };
  }, [userId]);

  const views = articles.reduce((total, article) => total + article.vue.length, 0);
  const likes = articles.reduce((total, article) => total + article.reaction1.length, 0);
  const dislikes = articles.reduce((total, article) => total + article.reaction2.length, 0);

  return { articles, comments, views, likes, dislikes, reactions: likes + dislikes };
}

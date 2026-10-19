"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";
import { CardSkeleton, Loading } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { notifyArticlesChanged } from "@/features/articles/events";
import { useI18n } from "@/i18n/I18nProvider";
import { deleteArticle, fetchArticles } from "@/lib/api-client";
import { useUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import type { Article } from "@/types";
import { type ReactionType, useReact } from "../useReact";
import { ArticleCard } from "./ArticleCard";

/**
 * « Mes articles » : la carte article commune, avec les actions Lire et
 * Supprimer. La suppression passe par un dialogue de confirmation.
 */
export default function MyArticlesList() {
  const { t, f } = useI18n();
  const toast = useToast();
  const userId = useUserId();
  const react = useReact();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState<Article | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    // Le filtre par auteur est fait par l'API (?authorId=).
    fetchArticles(userId)
      .then((list) => !cancelled && setArticles(list))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  const onReact = async (article: Article, type: ReactionType) => {
    const updated = await react(article, type);
    if (updated) setArticles((list) => list?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
  };

  const confirmDelete = async () => {
    const article = pending;
    if (!article) return;
    try {
      await deleteArticle(article.id);
      // Carte retiree et dialogue ferme dans le meme rendu : le declencheur
      // n'existant plus, le focus est rendu au contenu principal.
      setArticles((list) => list?.filter((item) => item.id !== article.id) ?? null);
      setPending(null);
      notifyArticlesChanged();
      toast(t.mine.deleted);
    } catch {
      setPending(null);
      toast(t.common.deleteFailed);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle>{t.titles.mine}</PageTitle>
        <ButtonLink href={ROUTES.newArticle}>{t.common.write}</ButtonLink>
      </div>

      {failed ? (
        <ErrorState
          message={t.common.loadError}
          retryLabel={t.common.retry}
          onRetry={() => {
            setFailed(false);
            setArticles(null);
            setAttempt((n) => n + 1);
          }}
        />
      ) : !articles ? (
        <Loading label={t.mine.loading}>
          <CardSkeleton />
          <CardSkeleton />
        </Loading>
      ) : articles.length === 0 ? (
        <EmptyState
          logo
          title={t.mine.empty}
          text={t.mine.emptySub}
          action={<ButtonLink href={ROUTES.newArticle}>{t.mine.firstArticle}</ButtonLink>}
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} userId={userId} onReact={onReact} onDelete={setPending} />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={t.mine.confirmTitle}
        description={pending ? f(t.mine.confirmText, { title: pending.titre }) : ""}
        confirmLabel={t.common.deleteForever}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

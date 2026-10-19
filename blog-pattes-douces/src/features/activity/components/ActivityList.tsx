"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/ui/EmptyState";
import { PageTitle, cardClass } from "@/components/ui/PageTitle";
import { BlockSkeleton, Loading } from "@/components/ui/Skeleton";
import { speciesLabel } from "@/features/articles/species";
import { CommentItem, useMyComments } from "@/features/comments/components/CommentList";
import { useI18n } from "@/i18n/I18nProvider";
import { Link } from "@/i18n/navigation";
import { fetchArticlesReactedBy } from "@/lib/api-client";
import { useUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import type { Article } from "@/types";

/** Nombre de commentaires montres ici ; la liste complete a sa propre page. */
const PREVIEW = 5;

/**
 * Activite et historique : mes derniers commentaires et les articles que
 * j'aime, chacun dans sa section, avec squelettes, etats vides et erreurs.
 */
export default function ActivityList() {
  const { t, f, date } = useI18n();
  const userId = useUserId();
  const myComments = useMyComments();
  const [liked, setLiked] = useState<Article[] | null>(null);
  const [likedFailed, setLikedFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    // L'API renvoie les articles aimes OU non aimes : on ne garde que les « J'aime ».
    fetchArticlesReactedBy(userId)
      .then((list) => !cancelled && setLiked(list.filter((article) => article.reaction1.includes(userId))))
      .catch(() => !cancelled && setLikedFailed(true));
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  const section = `${cardClass} flex flex-col gap-3 p-[22px]`;
  const empty = "m-0 rounded-xl bg-cream p-3.5 text-ink2";

  return (
    <>
      <PageTitle>{t.titles.activity}</PageTitle>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-5">
        <section aria-labelledby="titre-mes-commentaires" className={section}>
          <h2 id="titre-mes-commentaires" className="m-0 text-[22px] font-bold">
            {t.activity.myComments}
          </h2>
          {myComments.failed ? (
            <ErrorState message={t.common.loadError} retryLabel={t.common.retry} onRetry={myComments.retry} />
          ) : !myComments.comments ? (
            <Loading label={t.activity.loading}>
              <BlockSkeleton height={72} />
            </Loading>
          ) : myComments.comments.length === 0 ? (
            <p className={empty}>{t.activity.noComments}</p>
          ) : (
            <>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {myComments.comments.slice(0, PREVIEW).map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </ul>
              {myComments.comments.length > PREVIEW && (
                <Link href={ROUTES.comments} className="inline-flex min-h-11 items-center font-semibold text-link">
                  {t.activity.seeAllComments}
                </Link>
              )}
            </>
          )}
        </section>

        <section aria-labelledby="titre-articles-aimes" className={section}>
          <h2 id="titre-articles-aimes" className="m-0 text-[22px] font-bold">
            {t.activity.liked}
          </h2>
          {likedFailed ? (
            <ErrorState
              message={t.common.loadError}
              retryLabel={t.common.retry}
              onRetry={() => {
                setLikedFailed(false);
                setLiked(null);
                setAttempt((n) => n + 1);
              }}
            />
          ) : !liked ? (
            <Loading label={t.activity.loading}>
              <BlockSkeleton height={72} />
            </Loading>
          ) : liked.length === 0 ? (
            <p className={empty}>{t.activity.noLiked}</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {liked.map((article) => (
                <li key={article.id} className="flex flex-col gap-1 rounded-xl bg-cream px-4 py-3.5">
                  <Link href={ROUTES.article(article.id)} className="font-[650] text-ink">
                    <span lang={article.langue ?? undefined}>{article.titre}</span>
                  </Link>
                  <p className="m-0 text-sm text-ink2">
                    {f(t.common.by, { name: article.auteur?.pseudo ?? t.species.former })} (
                    {speciesLabel(t, article.auteur)}) · <time dateTime={article.date}>{date(article.date)}</time>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

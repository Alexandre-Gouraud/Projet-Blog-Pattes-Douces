"use client";

import { useEffect, useState } from "react";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";
import { BlockSkeleton, Loading } from "@/components/ui/Skeleton";
import { useI18n } from "@/i18n/I18nProvider";
import { Link } from "@/i18n/navigation";
import { fetchCommentsByCommenter } from "@/lib/api-client";
import { useUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import type { Comment } from "@/types";

/** Un commentaire de l'utilisateur : texte cite, date et lien vers l'article. */
export function CommentItem({ comment }: { comment: Comment }) {
  const { t, r, date } = useI18n();
  const article = comment.article_source;
  return (
    <li className="flex flex-col gap-1 rounded-xl bg-cream px-4 py-3.5">
      <p className="m-0 break-words">
        {r(t.common.quote, { text: <span key="texte" lang={comment.langue ?? undefined}>{comment.texte}</span> })}
      </p>
      <p className="m-0 text-sm text-ink2">
        <time dateTime={comment.date}>{date(comment.date)}</time> · {t.common.on}{" "}
        {article ? (
          <Link href={ROUTES.article(article.id)} className="font-semibold text-link">
            {article.titre}
          </Link>
        ) : (
          t.common.deletedArticle
        )}
      </p>
    </li>
  );
}

/** Commentaires ecrits par l'utilisateur, du plus recent au plus ancien. */
export function useMyComments() {
  const userId = useUserId();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchCommentsByCommenter(userId)
      .then((list) => !cancelled && setComments(list))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  return {
    comments,
    failed,
    retry: () => {
      setFailed(false);
      setComments(null);
      setAttempt((n) => n + 1);
    },
  };
}

/** Page « Mes commentaires » : la liste complete, liee depuis Activite. */
export default function CommentList() {
  const { t } = useI18n();
  const { comments, failed, retry } = useMyComments();

  return (
    <>
      <PageTitle>{t.titles.comments}</PageTitle>
      {failed ? (
        <ErrorState message={t.common.loadError} retryLabel={t.common.retry} onRetry={retry} />
      ) : !comments ? (
        <Loading label={t.activity.loading}>
          <BlockSkeleton />
          <BlockSkeleton />
        </Loading>
      ) : comments.length === 0 ? (
        <EmptyState title={t.activity.noComments} />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 rounded-2xl bg-surface p-[22px] shadow-md">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </ul>
      )}
    </>
  );
}

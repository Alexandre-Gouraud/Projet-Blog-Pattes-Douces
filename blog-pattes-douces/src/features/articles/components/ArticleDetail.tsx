"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BackArrowIcon, ThumbDownIcon, ThumbUpIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { PageTitle, cardClass } from "@/components/ui/PageTitle";
import { ArticleSkeleton, Loading } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/I18nProvider";
import { Link, usePathname } from "@/i18n/navigation";
import { ApiError, addView, createComment, fetchArticle } from "@/lib/api-client";
import { useIsLoggedIn, useUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import { LIMITS } from "@/lib/validation";
import type { ArticleWithComments } from "@/types";
import { speciesLabel } from "../species";
import { type ReactionType, useReact } from "../useReact";
import { ReactionButton } from "./ReactionButton";

type State =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error" }
  | { status: "ready"; article: ArticleWithComments };

/**
 * Detail d'un article (DESIGN.md §9.7) : retour, article, reactions et
 * commentaires. Un membre peut commenter ; un visiteur est invite a se
 * connecter. Le contenu garde sa langue d'origine (attribut lang).
 */
export default function ArticleDetail({ articleId: id }: { articleId: string }) {
  const { t, f, p, date, locale } = useI18n();
  const toast = useToast();
  const pathname = usePathname();
  const userId = useUserId();
  const loggedIn = useIsLoggedIn();
  const react = useReact();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const viewCounted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchArticle(id)
      .then((article) => !cancelled && setState({ status: "ready", article }))
      .catch((error) => {
        if (cancelled) return;
        setState({ status: error instanceof ApiError && error.status === 404 ? "missing" : "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  // Une vue par membre et par article (le serveur ignore les doublons).
  const article = state.status === "ready" ? state.article : null;
  useEffect(() => {
    if (!article || !userId || viewCounted.current) return;
    viewCounted.current = true;
    if (article.vue.includes(userId)) return;
    addView(article.id, userId)
      .then(() =>
        setState((current) =>
          current.status === "ready"
            ? { ...current, article: { ...current.article, vue: [...current.article.vue, userId] } }
            : current,
        ),
      )
      .catch(() => {
        // Une vue non comptee n'empeche pas la lecture.
      });
  }, [article, userId]);

  if (state.status === "loading") {
    return (
      <>
        <BackLink label={t.article.back} />
        <Loading label={t.article.loading}>
          <ArticleSkeleton />
        </Loading>
      </>
    );
  }

  if (state.status === "missing") {
    return (
      <>
        <BackLink label={t.article.back} />
        <PageTitle>{t.article.notFound}</PageTitle>
        <EmptyState
          logo
          title={t.article.notFoundText}
          action={<ButtonLink href={ROUTES.feed}>{t.errors.backFeed}</ButtonLink>}
        />
      </>
    );
  }

  if (state.status === "error") {
    return (
      <>
        <BackLink label={t.article.back} />
        <PageTitle>{t.titles.article}</PageTitle>
        <ErrorState
          message={t.common.loadError}
          retryLabel={t.common.retry}
          onRetry={() => {
            setState({ status: "loading" });
            setAttempt((n) => n + 1);
          }}
        />
      </>
    );
  }

  const current = state.article;
  const lang = current.langue ?? undefined;
  const author = current.auteur?.pseudo;
  const comments = current.commentaires ?? [];

  const onReact = async (type: ReactionType) => {
    const updated = await react(current, type);
    if (updated) setState({ status: "ready", article: updated });
  };

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending || !userId) return;
    const text = comment.trim();
    const error = !text ? t.article.errEmpty : text.length > LIMITS.commentaire ? t.article.errLong : null;
    if (error) {
      setCommentError(error);
      commentRef.current?.focus();
      return;
    }
    setCommentError(null);
    setSending(true);
    try {
      await createComment({ id_article: id, texte: text, commentataireId: userId, langue: locale });
      setComment("");
      toast(t.article.commentPosted);
      setState({ status: "ready", article: await fetchArticle(id) });
    } catch {
      toast(t.article.commentFailed);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <BackLink label={t.article.back} />
      <article className={`${cardClass} flex flex-col gap-[18px] p-5 desk:p-8`}>
        <PageTitle className="text-balance">
          <span lang={lang}>{current.titre}</span>
        </PageTitle>
        <div className="flex items-center gap-3">
          <Avatar name={author ?? "?"} seed={current.auteurId} size={44} />
          <p className="m-0 flex flex-col leading-[1.3]">
            <span className="font-semibold">{f(t.common.by, { name: author ?? t.species.former })}</span>
            <span className="text-sm text-ink3">
              {speciesLabel(t, current.auteur)} · <time dateTime={current.date}>{date(current.date)}</time> ·{" "}
              {p(t.common.count.views, current.vue.length)}
            </span>
          </p>
        </div>
        {current.image && (
          // Decorative : l'auteur est invite a decrire l'image dans son texte (DESIGN.md §7).
          <Image
            src={current.image}
            alt=""
            width={1200}
            height={800}
            sizes="(max-width: 1024px) 100vw, 864px"
            className="h-auto max-h-[480px] w-full rounded-xl object-cover"
          />
        )}
        <p className="m-0 max-w-[68ch] text-lg leading-[1.7] whitespace-pre-line text-ink">
          <span lang={lang}>{current.texte}</span>
        </p>
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <ReactionButton
            pressed={userId !== null && current.reaction1.includes(userId)}
            icon={<ThumbUpIcon />}
            count={current.reaction1.length}
            label={t.common.like}
            onClick={() => onReact("like")}
          />
          <ReactionButton
            pressed={userId !== null && current.reaction2.includes(userId)}
            icon={<ThumbDownIcon />}
            count={current.reaction2.length}
            label={t.common.dislike}
            onClick={() => onReact("dislike")}
          />
        </div>
      </article>

      <section
        id="commentaires"
        aria-labelledby="titre-commentaires"
        className={`${cardClass} flex flex-col gap-4 p-5 desk:p-8`}
      >
        <h2 id="titre-commentaires" className="m-0 text-[22px] font-bold">
          {f(t.article.commentsHeading, { count: comments.length })}
        </h2>
        {comments.length === 0 ? (
          <p className="m-0 text-ink2">{t.article.noComments}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {comments.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-xl bg-cream px-4 py-3.5">
                <Avatar name={item.commentataire?.pseudo ?? "?"} seed={item.commentataire?.id} size={36} />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="m-0 text-sm text-ink2">
                    <strong className="text-ink">{item.commentataire?.pseudo ?? t.species.former}</strong> ·{" "}
                    <time dateTime={item.date}>{date(item.date)}</time>
                  </p>
                  <p className="m-0 break-words whitespace-pre-line">
                    <span lang={item.langue ?? undefined}>{item.texte}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {loggedIn ? (
          <form onSubmit={submitComment} noValidate className="flex flex-col gap-2.5">
            <FormField id="commentaire" label={t.article.yourComment} error={commentError ?? undefined} errorPrefix={t.common.error}>
              {(control) => (
                <textarea
                  {...control}
                  ref={commentRef}
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className={`${control.className} resize-y`}
                />
              )}
            </FormField>
            <div>
              <Button type="submit">{t.article.publishComment}</Button>
            </div>
          </form>
        ) : (
          <p className="m-0 rounded-xl bg-cream px-4 py-3.5">
            <Link href={ROUTES.loginThen(pathname)} className="font-semibold">
              {t.article.loginLink}
            </Link>{" "}
            {t.article.toComment}
          </p>
        )}
      </section>
    </>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <div>
      <ButtonLink href={ROUTES.feed} variant="secondary">
        <BackArrowIcon />
        {label}
      </ButtonLink>
    </div>
  );
}

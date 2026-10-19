"use client";

import Link from "next/link";
import { CommentIcon, EyeIcon, ThumbDownIcon, ThumbUpIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/PageTitle";
import { useI18n } from "@/i18n/I18nProvider";
import { ROUTES } from "@/lib/routes";
import type { Article } from "@/types";
import type { ReactionType } from "../useReact";
import { speciesLabel } from "../species";
import { ReactionButton } from "./ReactionButton";

/**
 * Carte article, unique dans tout le site (DESIGN.md §9.6) : auteur, titre
 * (h2 contenant le lien), extrait, puis vues, reactions et commentaires.
 * Dans « Mes articles », `onDelete` ajoute en pied les actions Lire et
 * Supprimer, precisees par le titre en texte masque (RGAA 6.1).
 */
export function ArticleCard({
  article,
  userId,
  onReact,
  onDelete,
}: {
  article: Article;
  userId: string | null;
  onReact: (article: Article, type: ReactionType) => void;
  onDelete?: (article: Article) => void;
}) {
  const { t, date } = useI18n();
  const href = ROUTES.article(article.id);
  const lang = article.langue ?? undefined;
  const author = article.auteur?.pseudo;
  const liked = userId !== null && article.reaction1.includes(userId);
  const disliked = userId !== null && article.reaction2.includes(userId);
  const comments = article._count?.commentaires ?? 0;

  return (
    <article className={`${cardClass} flex flex-col gap-3 p-[22px]`}>
      <div className="flex items-center gap-3">
        <Avatar name={author ?? "?"} seed={article.auteurId} />
        <p className="m-0 flex min-w-0 flex-col leading-[1.3]">
          <span className="font-semibold">{author ?? t.species.former}</span>
          <span className="text-sm text-ink3">
            {speciesLabel(t, article.auteur)} · {t.publishedOn} <time dateTime={article.date}>{date(article.date)}</time>
          </span>
        </p>
      </div>

      <h2 className="m-0 text-xl leading-[1.3] font-[650]">
        <Link href={href} className="text-ink no-underline hover:underline">
          <span lang={lang}>{article.titre}</span>
        </Link>
      </h2>
      <p className="m-0 line-clamp-3 text-ink2">
        <span lang={lang}>{article.texte}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="inline-flex items-center gap-1.5 pe-1.5 text-sm text-ink3">
          <EyeIcon />
          {article.vue.length}
          <span className="sr-only"> {t.views}</span>
        </span>
        <ReactionButton
          pressed={liked}
          icon={<ThumbUpIcon />}
          count={article.reaction1.length}
          accessibleLabel={t.likeLabel(article.reaction1.length)}
          onClick={() => onReact(article, "like")}
        />
        <ReactionButton
          pressed={disliked}
          icon={<ThumbDownIcon />}
          count={article.reaction2.length}
          accessibleLabel={t.dislikeLabel(article.reaction2.length)}
          onClick={() => onReact(article, "dislike")}
        />
        <Link
          href={`${href}#commentaires`}
          className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-link"
        >
          <CommentIcon />
          {t.commentsN(comments)}
          <span className="sr-only"> {t.onTitle(article.titre)}</span>
        </Link>
      </div>

      {onDelete && (
        <div className="flex flex-wrap gap-2.5 border-t border-line pt-3">
          <ButtonLink href={href} variant="secondary">
            {t.read}
            <span className="sr-only"> {t.quote(article.titre)}</span>
          </ButtonLink>
          <Button variant="danger" onClick={() => onDelete(article)}>
            {t.delete}
            <span className="sr-only"> {t.quote(article.titre)}</span>
          </Button>
        </div>
      )}
    </article>
  );
}

"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";
import { CardSkeleton, Loading } from "@/components/ui/Skeleton";
import { useI18n } from "@/i18n/I18nProvider";
import { fetchArticles } from "@/lib/api-client";
import { useHydrated, useIsLoggedIn, useUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";
import type { Article } from "@/types";
import { type ReactionType, useReact } from "../useReact";
import { ArticleCard } from "./ArticleCard";
import { VisitorBanner } from "./VisitorBanner";

function matches(article: Article, query: string): boolean {
  const haystack = `${article.titre} ${article.texte} ${article.auteur?.pseudo ?? ""}`;
  return haystack.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

/**
 * Fil d'actualite (DESIGN.md §15) : bandeau visiteur, recherche sur le titre,
 * le texte et l'auteur, nombre de resultats annonce (role="status"),
 * squelettes au chargement, etat vide et erreur.
 */
export default function ArticleFeed() {
  const { t, f, p } = useI18n();
  const hydrated = useHydrated();
  const loggedIn = useIsLoggedIn();
  const userId = useUserId();
  const react = useReact();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchArticles()
      .then((list) => !cancelled && setArticles(list))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setFailed(false);
    setArticles(null);
    setAttempt((n) => n + 1);
  };

  const onReact = async (article: Article, type: ReactionType) => {
    const updated = await react(article, type);
    if (updated) setArticles((list) => list?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
  };

  const search = query.trim();
  const visible = articles && search ? articles.filter((article) => matches(article, search)) : articles;
  const status = visible ? (search ? p(t.feed.found, visible.length) : p(t.common.count.articles, visible.length)) : "";

  return (
    <>
      {hydrated && !loggedIn && <VisitorBanner />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle>{t.titles.feed}</PageTitle>
        {loggedIn && <ButtonLink href={ROUTES.newArticle}>{t.common.write}</ButtonLink>}
      </div>

      <div role="search" className="flex items-center gap-2.5 rounded-xl bg-surface px-3.5 shadow-sm">
        <SearchIcon className="shrink-0 text-ink3" />
        <label htmlFor="recherche" className="sr-only">
          {t.feed.searchLabel}
        </label>
        <input
          id="recherche"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.feed.searchPlaceholder}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-ink outline-offset-4"
        />
      </div>
      <p role="status" className="-mt-3 mb-0 text-[15px] font-semibold text-ink">
        {status}
      </p>

      {failed ? (
        <ErrorState message={t.common.loadError} retryLabel={t.common.retry} onRetry={retry} />
      ) : !visible ? (
        <Loading label={t.feed.loading}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </Loading>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-cream p-7 text-center text-ink">
          {search ? f(t.feed.noMatch, { query: search }) : t.feed.empty}
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {visible.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} userId={userId} onReact={onReact} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

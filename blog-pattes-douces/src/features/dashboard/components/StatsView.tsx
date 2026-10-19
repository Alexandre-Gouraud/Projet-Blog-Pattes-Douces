"use client";

import { ErrorState } from "@/components/ui/EmptyState";
import { PageTitle, cardClass } from "@/components/ui/PageTitle";
import { BlockSkeleton, Loading } from "@/components/ui/Skeleton";
import { Bars, Donut, StatTiles } from "@/components/ui/Stats";
import { useUserStats } from "@/features/dashboard/hooks/useUserStats";
import { useI18n } from "@/i18n/I18nProvider";

/** Part en %, arrondie, sans division par zero. */
function percent(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/**
 * Statistiques (DESIGN.md §9.10) : tuiles, anneau j'aime / je n'aime pas,
 * barres chiffrees et tableau « Detail par article », alternative textuelle
 * complete des graphiques (caption, th scope).
 */
export default function StatsView() {
  const { t, f } = useI18n();
  const stats = useUserStats();
  const received = stats.comments.length;
  const likePercent = percent(stats.likes, stats.reactions);
  const dislikePercent = stats.reactions ? 100 - likePercent : 0;
  const section = `${cardClass} flex flex-col gap-4 p-[22px]`;
  const cell = "px-2 py-2.5 text-end";

  return (
    <>
      <PageTitle>{t.titles.stats}</PageTitle>
      {stats.failed ? (
        <ErrorState message={t.common.loadError} retryLabel={t.common.retry} onRetry={stats.retry} />
      ) : stats.loading ? (
        <Loading label={t.stats.loading}>
          <BlockSkeleton />
          <BlockSkeleton height={260} />
        </Loading>
      ) : (
        <>
          <StatTiles
            tiles={[
              { label: t.profile.tiles.articles, value: stats.articles.length },
              { label: t.profile.tiles.views, value: stats.views },
              { label: t.profile.tiles.reactions, value: stats.reactions },
              { label: t.profile.tiles.comments, value: received },
            ]}
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5">
            <section aria-labelledby="titre-repartition" className={`${section} items-center`}>
              <h2 id="titre-repartition" className="m-0 self-start text-xl font-bold">
                {t.stats.distribution}
              </h2>
              <Donut
                likes={stats.likes}
                dislikes={stats.dislikes}
                alt={
                  stats.reactions
                    ? f(t.stats.donutAlt, {
                        likes: stats.likes,
                        likePercent,
                        dislikes: stats.dislikes,
                        dislikePercent,
                      })
                    : t.stats.donutNone
                }
                totalLabel={t.stats.total}
                likeLegend={f(t.stats.likeLegend, { count: stats.likes, percent: likePercent })}
                dislikeLegend={f(t.stats.dislikeLegend, { count: stats.dislikes, percent: dislikePercent })}
              />
            </section>
            <section aria-labelledby="titre-barres" className={section}>
              <h2 id="titre-barres" className="m-0 text-xl font-bold">
                {t.stats.overview}
              </h2>
              <Bars
                bars={[
                  { label: t.stats.columns.views, value: stats.views, color: "var(--color-chart-view)" },
                  { label: t.stats.columns.likes, value: stats.likes, color: "var(--color-chart-like)" },
                  { label: t.stats.columns.dislikes, value: stats.dislikes, color: "var(--color-chart-dislike)" },
                  { label: t.stats.columns.comments, value: received, color: "var(--color-chart-comment)" },
                ]}
              />
            </section>
          </div>
          <section aria-labelledby="titre-detail" className={`${section} gap-3`}>
            <h2 id="titre-detail" className="m-0 text-xl font-bold">
              {t.stats.detail}
            </h2>
            {stats.articles.length === 0 ? (
              <p className="m-0 text-ink2">{t.stats.publishFirst}</p>
            ) : (
              // Seul ce tableau peut defiler horizontalement, dans son conteneur (DESIGN.md §6.3).
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-labelledby="titre-detail">
                <table className="w-full min-w-[480px] border-collapse text-[15px]">
                  <caption className="sr-only">{t.stats.caption}</caption>
                  <thead>
                    <tr className="border-b-2 border-line">
                      <th scope="col" className="px-2 py-2.5 text-start">
                        {t.stats.columns.article}
                      </th>
                      <th scope="col" className={cell}>
                        {t.stats.columns.views}
                      </th>
                      <th scope="col" className={cell}>
                        {t.stats.columns.likes}
                      </th>
                      <th scope="col" className={cell}>
                        {t.stats.columns.dislikes}
                      </th>
                      <th scope="col" className={cell}>
                        {t.stats.columns.comments}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.articles.map((article) => (
                      <tr key={article.id} className="border-b border-line">
                        <th scope="row" className="px-2 py-2.5 text-start font-semibold">
                          <span lang={article.langue ?? undefined}>{article.titre}</span>
                        </th>
                        <td className={cell}>{article.vue.length}</td>
                        <td className={cell}>{article.reaction1.length}</td>
                        <td className={cell}>{article.reaction2.length}</td>
                        <td className={cell}>{article._count?.commentaires ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

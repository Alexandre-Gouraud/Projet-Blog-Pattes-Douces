"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/EmptyState";
import { PageTitle, cardClass } from "@/components/ui/PageTitle";
import { BlockSkeleton, Loading } from "@/components/ui/Skeleton";
import { StatTiles } from "@/components/ui/Stats";
import { useToast } from "@/components/ui/Toast";
import { speciesLabel } from "@/features/articles/species";
import { useLogout } from "@/features/auth/useLogout";
import { useUserStats } from "@/features/dashboard/hooks/useUserStats";
import { useI18n } from "@/i18n/I18nProvider";
import { useRouter } from "@/i18n/navigation";
import { deleteAccount, fetchUser } from "@/lib/api-client";
import { clearSession, usePseudo, useSpecies, useUserId } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

/**
 * Profil : identite (avatar, pseudo, espece, biographie), resume chiffre et
 * actions. La suppression du compte passe par un dialogue de confirmation.
 */
export default function ProfileView() {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const logout = useLogout();
  const pseudo = usePseudo() ?? "";
  const userId = useUserId();
  const espece = useSpecies();
  const stats = useUserStats();
  const [bio, setBio] = useState<string | null | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchUser(userId)
      .then((user) => setBio(user.biographie ?? null))
      .catch(() => setBio(null));
  }, [userId]);

  const confirmDelete = async () => {
    setConfirming(false);
    if (!userId) return;
    try {
      await deleteAccount(userId);
      clearSession();
      toast(t.profile.deleted);
      router.push(ROUTES.feed);
    } catch {
      toast(t.common.deleteFailed);
    }
  };

  return (
    <>
      <PageTitle>{t.titles.profile}</PageTitle>
      <section aria-label={t.profile.identity} className={`${cardClass} flex flex-wrap items-center gap-5 p-5 desk:p-8`}>
        <Avatar name={pseudo} seed={userId ?? pseudo} size={88} />
        <div className="flex flex-[1_1_240px] flex-col gap-1.5">
          <p className="m-0 text-2xl font-bold">{pseudo}</p>
          <p className="m-0 flex">
            <span className="rounded-full bg-tint px-2.5 py-0.5 text-sm font-semibold text-ink">
              {speciesLabel(t, { espece })}
            </span>
          </p>
          {bio !== undefined && <p className="m-0 text-ink2">{bio || t.profile.noBio}</p>}
        </div>
      </section>

      <section aria-labelledby="titre-resume" className="flex flex-col gap-3">
        <h2 id="titre-resume" className="m-0 text-2xl font-bold">
          {t.profile.summary}
        </h2>
        {stats.failed ? (
          <ErrorState message={t.common.loadError} retryLabel={t.common.retry} onRetry={stats.retry} />
        ) : stats.loading ? (
          <Loading label={t.stats.loading}>
            <BlockSkeleton />
          </Loading>
        ) : (
          <StatTiles
            tiles={[
              { label: t.profile.tiles.articles, value: stats.articles.length },
              { label: t.profile.tiles.views, value: stats.views },
              { label: t.profile.tiles.reactions, value: stats.reactions },
              { label: t.profile.tiles.comments, value: stats.comments.length },
            ]}
          />
        )}
      </section>

      <div className="flex flex-wrap gap-3 rounded-2xl bg-surface px-5 py-[18px]">
        <ButtonLink href={ROUTES.myArticles}>{t.profile.seeMine}</ButtonLink>
        <Button variant="secondary" onClick={logout}>
          {t.shell.logout}
        </Button>
        <Button variant="danger" className="ms-auto" onClick={() => setConfirming(true)}>
          {t.profile.deleteAccount}
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        title={t.profile.confirmTitle}
        description={t.profile.confirmText}
        confirmLabel={t.common.deleteForever}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}

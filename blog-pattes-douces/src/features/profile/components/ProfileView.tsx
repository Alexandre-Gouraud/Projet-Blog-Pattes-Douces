"use client";

import MyArticlesList from "@/features/articles/components/MyArticlesList";
import StatsOverview from "@/features/dashboard/components/StatsOverview";
import { deleteAccount } from "@/lib/api-client";
import { clearSession, getUserId, usePseudo } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

const ProfileView = () => {
  const pseudo = usePseudo();

  const handleLogout = () => {
    clearSession();
    window.location.href = ROUTES.feed;
  };

  const handleDeleteAccount = async () => {
    const userId = getUserId();
    if (!userId) {
      console.error("Erreur: Aucun utilisateur identifié.");
      return;
    }

    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer le compte ?");
    if (!confirmation) return;

    try {
      await deleteAccount(userId);
      clearSession();
      window.location.href = ROUTES.feed;
    } catch (error) {
      console.error("Erreur lors de la suppression du compte :", error);
    }
  };

  return (
    <>
      <h1
        className="text-center text-3xl font-bold mt-4 bg-white p-4 rounded shadow-md"
        style={{ margin: "20px" }}
      >
        Bienvenue sur votre profil : {pseudo}
      </h1>

      <MyArticlesList />
      <StatsOverview />

      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={handleLogout}
          className="bg-[#FFB371] text-white px-4 py-2 rounded hover:bg-[#D9D9D9] hover:text-[#444444] transition-colors"
        >
          Se déconnecter
        </button>
        <button
          onClick={handleDeleteAccount}
          className="bg-[#FFB371] text-white px-4 py-2 rounded hover:bg-[#D9D9D9] hover:text-[#444444] transition-colors"
        >
          Supprimer le compte
        </button>
      </div>
    </>
  );
};

export default ProfileView;

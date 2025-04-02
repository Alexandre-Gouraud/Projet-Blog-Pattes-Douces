"use client";

import React, { useState, useEffect } from "react";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import Post_user from "../Post_user/page";

import Sidebar from "../layout/AppSidebar";
import { SidebarProvider } from "@/src/context/SidebarContext";

const Profil = () => {
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const [pseudo, setPseudo] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPseudo = localStorage.getItem("pseudo");
      setPseudo(storedPseudo);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pseudo");
    localStorage.removeItem("user_id");
    window.location.href = "../Feed";
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      console.error("Erreur: Aucun utilisateur identifié.");
      return;
    }

    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer le compte ?");
    if (!confirmation) return;

    try {
      const response = await fetch("/api/supp_compte", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      if (response.ok) {
        console.log("Compte supprimé avec succès");
        localStorage.removeItem("pseudo");
        localStorage.removeItem("user_id");
        window.location.href = "../Feed";
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de la suppression du compte :", errorData.error);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  return (
    <html lang="fr">
      <body>
        {/* Navbar dynamique en fonction de l'état de l'utilisateur */}
        {/* {isConnected ? <Navbar /> : <Navbar_connecte />} */}

        {/* Wrapper pour la sidebar et le contenu principal */}
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Contenu principal, décalé par la sidebar */}
          <div className="ml-64 flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <h1
              className="text-center text-3xl font-bold mt-4 bg-white p-4 rounded shadow-md"
              style={{ margin: "20px" }}
            >
              Bienvenue sur votre profil : {pseudo}
            </h1>

            {/* Feedhome ou tout autre contenu principal */}
            <main
              className="flex-1 p-8"
              style={{
                background:
                  "linear-gradient(90deg, hsla(28, 100%, 72%, 1) 0%, hsla(28, 38%, 43%, 1) 100%)",
              }}
            >
              <SidebarProvider>
                <Post_user />
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
              </SidebarProvider>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
};

export default Profil;

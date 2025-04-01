"use client";

import React, { useState, useEffect } from "react";
import NavbarAff from "../Components/navigation/Navbar_aff";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import Post_user from "../Post_user/page";
import Dashboard from "../Components/dashboard";

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
    <>
      <NavbarAff />
      <Header />
      <div className="text-[#444444] p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-4 text-[#996C44] text-center">Profil</h1>
        <p className="text-lg mb-6">
          Bienvenue <span className="font-semibold">{pseudo}</span> !
        </p>
      </div>
      <Post_user />
      <Dashboard />
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
      <Footer />
    </>
  );
};

export default Profil;

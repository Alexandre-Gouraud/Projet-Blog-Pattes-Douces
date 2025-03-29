"use client";

import React from "react";
import Link from "next/link";
import NavbarAff from "../Components/navigation/Navbar_aff";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";

import { useState, useEffect } from "react";

const Profil = () => {

  const [pseudo, setPseudo] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPseudo = localStorage.getItem("pseudo");
      setPseudo(storedPseudo);
    }
  }, []);

  
  const Deconnexion = () => {
    localStorage.removeItem("pseudo");
    window.location.href = "../Feed"; 
  }

  return (
    <>
      <NavbarAff/>
      <Header/>
      <h1>Profil</h1>
      <p>Bienvenue sur votre profil {pseudo} !</p>
      <button onClick={Deconnexion}>Se déconnecter</button>
      <Footer />
    </>
  );
};

export default Profil;

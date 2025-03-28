"use client";

import React from "react";
import Link from "next/link";
import NavbarAff from "../Components/navigation/Navbar_aff";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";

import { useState, useEffect } from "react";

const Profil = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const UserId = localStorage.getItem("userId");
    setUserId(UserId);
  }, []);
  

  const Deconnexion = () => {
    localStorage.removeItem("userId");
    window.location.href = "../Feed"; 
  }

  return (
    <>
      <NavbarAff/>
      <Header/>
      <h1>Profil</h1>
      <p>Bienvenue sur votre profil {userId} !</p>
      <button onClick={Deconnexion}>Se déconnecter</button>
      <Footer />
    </>
  );
};

export default Profil;

"use client";

import React from "react";
import Link from "next/link";
import NavbarAff from "../Components/navigation/Navbar_aff";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";

import { useState, useEffect } from "react";

const Profil = () => {
  return (
    <>
      <NavbarAff/>
      <Header/>
      <Footer />
    </>
  );
};

export default Profil;

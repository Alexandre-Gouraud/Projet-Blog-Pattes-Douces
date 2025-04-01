"use client";
import React, { useEffect } from "react";

import Image from "next/image";
import Navbar from "./layout/navigation/Navbar";
import NavbarAff from "./layout/navigation/Navbar_aff";
import Navbar_connecte from "./layout/navigation/Navbar_connecte";
import Header from "./layout/navigation/Header";
import Footer from "./layout/navigation/Footer";
import Posts from "./Components/Posts/Posts";
import Feedhome from "./Components/feed";
import { useState } from "react";


const navbar_aff = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("userId") != null) {
      setIsConnected(true);
    }
  }, []);

  return isConnected ? <Navbar /> : <Navbar_connecte />;
};

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <Header />
        <Feedhome />
        {/* <Dashboard /> */}
        {/* <Home /> */}
        <Footer />
        {children}
      </body>
    </html>
  );
}

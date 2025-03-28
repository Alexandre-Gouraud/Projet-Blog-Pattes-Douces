"use client";
import React, { useEffect } from "react";

import Image from "next/image";
import Feedhome from "./Components/feed/Feedhome";
import Header from "./Components/navigation/Header";
import Navbar from "./Components/navigation/Navbar";
import Footer from "./Components/navigation/Footer";
import Navbar_connecte from "./Components/navigation/Navbar_connecte";
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
        {/* <Home /> */}
        <Footer />
        {children}
      </body>
    </html>
  );
}

"use client";
import React from "react";

import Feedhome from "./Components/feed";
import Header from "./Components/navigation/Header";
import Navbar from "./Components/navigation/Navbar";
import Footer from "./Components/navigation/Footer";

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

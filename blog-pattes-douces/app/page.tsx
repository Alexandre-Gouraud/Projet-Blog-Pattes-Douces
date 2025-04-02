"use client";

import React, { useEffect, useState } from "react";

import Navbar from "./layout/navigation/Navbar";
import Navbar_connecte from "./layout/navigation/Navbar_connecte";
import Header from "./layout/AppHeader";
import Sidebar from "./layout/AppSidebar";
import Footer from "./layout/navigation/Footer";

import { SidebarProvider } from "@/src/context/SidebarContext";
import Feedhome from "./Components/feed";

export default function App({ children }: { children: React.ReactNode }) {
  // Vérifier si l'utilisateur est connecté
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("userId") != null) {
      setIsConnected(true);
    }
  }, []);

  return (
    <html lang="fr">
      <body>
        {/* Navbar dynamique en fonction de l'état de l'utilisateur */}
        {isConnected ? <Navbar /> : <Navbar_connecte />}

        {/* Wrapper pour la sidebar et le contenu principal */}
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Contenu principal, décalé par la sidebar */}
          <div className="ml-64 flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <Header />

            {/* Feedhome ou tout autre contenu principal */}
            <main className="flex-1 p-8 bg-gray-100">
              <Feedhome />
              <SidebarProvider>{children}</SidebarProvider>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}

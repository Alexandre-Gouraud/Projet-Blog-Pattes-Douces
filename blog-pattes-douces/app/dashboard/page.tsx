import React from "react";
import { useEffect, useState } from "react";
import Sidebar from "../layout/AppSidebar";
import Header from "../layout/AppHeader";
import Footer from "../layout/navigation/Footer";

import Feedhome from "../Components/feed";
import { SidebarProvider } from "@/src/context/SidebarContext";

import DashboardComponent from "../Components/dashboard";
import Graph from "../Components/Stats/metrics/graph";
import Navbar from "../layout/navigation/Navbar";

import Post_user from "../Components/Post_user";

const Dashboard = () => {
  return (
    <>
      {/* Navbar dynamique en fonction de l'état de l'utilisateur */}
      {/* {isConnected ? <Navbar /> : <Navbar_connecte />} */}

      {/* Wrapper pour la sidebar et le contenu principal */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Contenu principal, décalé par la sidebar */}
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <Header />

          {/* Feedhome ou tout autre contenu principal */}
          <main
            className="flex-1 p-8"
            style={{
              background:
                "linear-gradient(90deg, hsla(28, 100%, 72%, 1) 0%, hsla(28, 38%, 43%, 1) 100%)",
            }}
          >
            <SidebarProvider>
              <DashboardComponent />
              <Graph />
              <Post_user />
            </SidebarProvider>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
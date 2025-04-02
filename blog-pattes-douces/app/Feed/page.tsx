"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// import Navbar from "../layout/navigation/Navbar";
// import NavbarAff from "../layout/navigation/Navbar_aff";
// import Navbar_connecte from "../layout/navigation/Navbar_connecte";
// import Posts from "../Components/Posts/Posts";

import Sidebar from "../layout/AppSidebar";
import Header from "../layout/AppHeader";
import Footer from "../layout/navigation/Footer";

import Feedhome from "../Components/feed";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/src/context/SidebarContext";

const Feed = () => {
  return (
    <>
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
              <Feedhome />
            </SidebarProvider>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
};
export default Feed;
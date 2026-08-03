"use client";
import React from "react";
import Link from "next/link";
import Activity from "../Components/activity";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Header from "../layout/AppHeader";
import NavbarAff from "../Components/navigation/Navbar_aff";

import Sidebar from "../layout/AppSidebar";
import { SidebarProvider } from "@/src/context/SidebarContext";
import { useState, useEffect } from "react";

const Act = () => {
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

        {/* Activité ou tout autre contenu principal */}
        <main
        className="flex-1 p-8"
        style={{
          background:
          "linear-gradient(90deg, hsla(28, 100%, 72%, 1) 0%, hsla(28, 38%, 43%, 1) 100%)",
        }}
        >
        <Activity userId="67eab2c1bbb0b4f399cca109" />
        </main>

        {/* Footer */}
        <Footer />
      </div>
      </div>
    </>
  );
}
export default Act;

// 67e1669b5db1ca61e8ea365f test commentaire

// 67eab2c1bbb0b4f399cca109 test article

// 67eadf9c13c2739e49d02903 test like
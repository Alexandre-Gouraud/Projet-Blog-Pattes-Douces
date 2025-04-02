"use client";

import React from "react";
import Sidebar from "../layout/AppSidebar";
import Header from "../layout/AppHeader";
import Footer from "../layout/navigation/Footer";
import Feedhome from "../Components/feed";
import { SidebarProvider } from "@/src/context/SidebarContext";
import AfficherSidebar from "../layout/AfficherSidebar";

const Feed = () => {
  return (
    <>
      {/* Wrapper for the sidebar and main content */}
      <div className="flex">
        {/* Sidebar */}
        <AfficherSidebar />

        {/* Main content, offset by the sidebar */}
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <Header />

          {/* Feedhome or other main content */}
          <main
            className="flex-1 p-8"
            style={{
              backgroundColor: "#928b99",
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

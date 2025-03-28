"use client";

import React from "react";
import Link from "next/link";
import Feedhome from "../Components/feed/Feedhome";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import Navbar_connecte from "../Components/navigation/Navbar_connecte";

import { useState, useEffect } from "react";

const navbar_aff = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("userId") != null) {
      setIsConnected(true);
    }
  }, []);

  return isConnected ? <Navbar /> : <Navbar_connecte />;
};

const Feed = () => {
  return (
    <>
      {navbar_aff()}
      <Header />
      <Feedhome />
      <Footer />
    </>
  );
}
export default Feed;
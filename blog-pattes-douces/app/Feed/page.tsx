"use client";

import React from "react";
import Link from "next/link";
import Feedhome from "../Components/feed/Feedhome";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import Navbar_connecte from "../Components/navigation/Navbar_connecte";

const navbar_aff = () => {
  if (localStorage.getItem("userId") != null) 
    return <Navbar_connecte />;
  else 
    return <Navbar />;
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
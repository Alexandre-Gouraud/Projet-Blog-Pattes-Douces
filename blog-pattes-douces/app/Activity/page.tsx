"use client";

import React from "react";
import Link from "next/link";
import Activity from "../Components/activity/activity";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import Navbar_connecte from "../Components/navigation/Navbar_connecte";

const navbar_aff = () => {
  if (localStorage.getItem("userId") != null) return <Navbar_connecte />;
  else return <Navbar />;
};

const Act = () => {
  return (
    <>
      {navbar_aff()}
      <Header />
      <Activity userId="67e1669b5db1ca61e8ea365f" />
      <Footer />
    </>
  );
}
export default Act;
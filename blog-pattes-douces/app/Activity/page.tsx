"use client";
import React from "react";
import Link from "next/link";
import Activity from "../Components/activity";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import NavbarAff from "../Components/navigation/Navbar_aff";
import { useState, useEffect } from "react";

const Act = () => {
  return (
    <>
      <NavbarAff />
      <Header />
      <Activity userId="67e1669b5db1ca61e8ea365f" />
      <Footer />
    </>
  );
}
export default Act;

// 67e1669b5db1ca61e8ea365f test commentaire

// 67e1669b5db1ca61e8ea365f test article


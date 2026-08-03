"use client";
import React from "react";
import Link from "next/link";
import ComUser from "../Components/dispComUser";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import NavbarAff from "../Components/navigation/Navbar_aff";
import { useState, useEffect } from "react";

const CommentPage = () => {
  return (
    <>
      <NavbarAff />
      <Header />
      <ComUser  />
      <Footer />
    </>
  );
}
export default CommentPage;
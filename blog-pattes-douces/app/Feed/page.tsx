"use client";

import React from "react";
import Link from "next/link";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import NavbarAff from "../Components/navigation/Navbar_aff";
import Feedhome from "../Components/feed";
import { useState, useEffect } from "react";

const Feed = () => {
  return (
    <>
      <NavbarAff/>
      <Header />
      <Feedhome />
      <Footer />
    </>
  );
}
export default Feed;
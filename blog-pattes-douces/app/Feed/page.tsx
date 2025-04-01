"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../layout/navigation/Navbar";
import NavbarAff from "../layout/navigation/Navbar_aff";
import Navbar_connecte from "../layout/navigation/Navbar_connecte";
import Header from "../layout/navigation/Header";
import Footer from "../layout/navigation/Footer";
import Posts from "../Components/Posts/Posts";
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
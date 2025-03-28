"use client";

import React from "react";
import Link from "next/link";
import Feedhome from "../Components/feed/Feedhome";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import Navbar_Aff from "../Components/navigation/Navbar_aff";
import { useState, useEffect } from "react";

const Feed = () => {
  return (
    <>
      <Navbar_Aff/>
      <Header />
      <Feedhome />
      <Footer />
    </>
  );
}
export default Feed;
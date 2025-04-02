"use client"
import React from "react";
import Link from "next/link";
import Creation_article from "../Components/creation_article/page"; 
import Navbar from "../Components/navigation/Navbar_connecte";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";


const Feed = () => {
  return (
    <>
      <Navbar />
      <Header />
      <Creation_article/>
      <Footer />
    </>
  );
}
export default Feed;
import React from "react";
import Link from "next/link";
import Feedhome from "../Components/feed/Feedhome";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";

const Feed = () => {
  return (
    <>
      <Navbar />
      <Header />
      <Feedhome />
      <Footer />
    </>
  );
}
export default Feed;
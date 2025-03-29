import React from "react";
import Link from "next/link";
import Article_user from "../Components/articles_user/page";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";

const Feed = () => {
  return (
    <>
      <Navbar />
      <Header />
      <Article_user/>
      <Footer />
    </>
  );
}
export default Feed;
import React from "react";
import Link from "next/link";
import Activity from "../Components/activity/activity";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";

const Act = () => {
  return (
    <>
      <Navbar />
      <Header />
      <Activity userId="67e1669b5db1ca61e8ea365f" />
      <Footer />
    </>
  );
}
export default Act;
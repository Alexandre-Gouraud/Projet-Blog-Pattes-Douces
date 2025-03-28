import React from "react";
import Link from "next/link";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";
import Inscription from "../Inscription";

const Profile = () => {
  return (
    <>
      <Navbar />
      <Inscription />
      <Footer />
    </>
  );
};

export default Profile;

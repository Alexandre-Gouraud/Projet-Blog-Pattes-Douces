import React from "react";
import Link from "next/link";
import Connexion from "../Components/connexion/page";
import Inscription from "../Components/Inscription/page";
import Navbar from "../Components/navigation/Navbar";
import Footer from "../Components/navigation/Footer";

const Profile = () => {
  return (
    <>
      <Navbar />
      <Connexion />
      <Footer />
    </>
  );
};

export default Profile;

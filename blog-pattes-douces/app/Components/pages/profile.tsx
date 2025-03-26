import React from "react";
import Link from "next/link";
import Connexion from "../connexion/page";
import Inscription from "../inscription/page";
import Navbar from "../navigation/Navbar";
import Footer from "../navigation/Footer";

const Profile = () => {
  return (
    <>
      <Navbar />
      <Connexion />
      <p>
        Première fois sur Pattes Douces ?{" "}
        <Link href="/inscription">Inscrivez-vous</Link>
      </p>
      <Footer />
    </>
  );
};

export default Profile;

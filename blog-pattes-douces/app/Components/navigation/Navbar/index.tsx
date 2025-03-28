import React from "react";
import Link from "next/link";
import Feedhome from "../../feed/Feedhome";
import Profile from "../../../Profile/page";
import Feed from "../../feed/Feedhome";
// import Logo from "./Components/Navbar/Logo";
// import Button from "./Components/Navbar/Navbar";

const Navbar = () => {
  return (
    <div className="navbar">
      <div
        className="w-full h-20"
        style={{
          background:
            "linear-gradient(90deg, hsla(28, 38%, 43%, 1) 0%, hsla(0, 0%, 27%, 1) 100%)",
        }}
      >
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-end items-center h-full">
            <ul className="hidden md:flex gap-x-6 text-white">
              <li>
                <a href="/Connexion">Profile</a>
              </li>
              <li>
                <a href="/Feed">Feed</a>
              </li>
              <li>
                <Link href="/activity">
                  <p>Activité</p>
                </Link>
              </li>
              <li>
                <a href="/Dashboard">Dashboard</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

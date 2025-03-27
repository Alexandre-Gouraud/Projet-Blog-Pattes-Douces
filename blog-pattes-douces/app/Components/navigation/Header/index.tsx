import React from "react";
import Link from "next/link";
import Feedhome from "../../../Feed/page";
import Profile from "../../../Profile/page";
import Feed from "../../../../assets/page";
// import Logo from "./Components/Navbar/Logo";
// import Button from "./Components/Navbar/Navbar";

const Header = () => {
  return (
    <div className="header">
      <h1>Pattes Douces</h1>
      <div
        className="w-full h-20"
        style={{
          background:
            "linear-gradient(90deg, hsla(28, 38%, 43%, 1) 0%, hsla(0, 0%, 27%, 1) 100%)",
        }}
      ></div>
    </div>
  );
};

export default Header;

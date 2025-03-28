import React, { useState, useEffect } from "react";
import Navbar_connecte from "../Navbar_connecte";
import Navbar from "../Navbar";

const NavbarAff = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && localStorage.getItem("pseudo") !== null) {
            setIsConnected(true);
        }
    }, []);

    return isConnected ? <Navbar_connecte /> : <Navbar />;
};

export default NavbarAff;

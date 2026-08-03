import React, { useState, useEffect } from "react";
import Sidebar from "./AppSidebar"; 
import CoSidebar from "./CoSidebar";

const AfficherSidebar = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && localStorage.getItem("pseudo") !== null) {
            setIsConnected(true);
        }
    }, []);

    return isConnected ? <CoSidebar /> : <Sidebar />;
};

export default AfficherSidebar;
import React from "react";
import { useEffect, useState } from "react";
import DashboardComponent from "../Components/dashboard";
import Graph from "../Components/Stats/metrics/graph";
import Navbar from "../layout/navigation/Navbar";
import NavbarAff from "../layout/navigation/Navbar_aff";
import Navbar_connecte from "../layout/navigation/Navbar_connecte";
import Header from "../layout/navigation/Header";
import Footer from "../layout/navigation/Footer";
import Posts from "../Components/Posts/Posts";
import Feedhome from "../Components/feed";
import Post_user from "../Components/Post_user";

const Dashboard = () => {
  return (
    <>
    <Navbar />
    <Post_user />
    <DashboardComponent />
    <Graph /> 
    </>
  );
};

export default Dashboard;
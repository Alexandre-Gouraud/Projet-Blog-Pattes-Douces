import React from "react";
import { useEffect, useState } from "react";
import DashboardComponent from "../Components/dashboard";
import Graph from "../Components/Stats/metrics/graph";
import Navbar from "../Components/navigation/Navbar_connecte";
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
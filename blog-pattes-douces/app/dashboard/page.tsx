import React from "react";
import { useEffect, useState } from "react";
import DashboardComponent from "../Components/dashboard";
import Graph from "../Components/Stats/metrics/graph";
import StatsMetrics from "../Components/Stats/metrics";
import Navbar from "../Components/navigation/Navbar_connecte";

const Dashboard = () => {
  return (
    <>
    <Navbar />
    <Graph />
    <DashboardComponent />
    <StatsMetrics />
    
      
    </>
  );
};

export default Dashboard;
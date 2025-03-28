import Image from "next/image";
import Feedhome from "./Components/feed/Feedhome";
import Header from "./Components/navigation/Header";
import Navbar from "./Components/navigation/Navbar";
import Footer from "./Components/navigation/Footer";
import Dashboard from "./Components/dashboard/page";
import "./globals.css";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <Header />
        <Feedhome />
        <Dashboard />
        {/* <Home /> */}
        <Footer />
        {children}
      </body>
    </html>
  );
}

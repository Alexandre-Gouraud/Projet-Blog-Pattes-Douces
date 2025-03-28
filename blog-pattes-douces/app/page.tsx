import Image from "next/image";
import Feedhome from "./Components/feed/Feedhome";
import Header from "./Components/navigation/Header";
import Navbar from "./Components/navigation/Navbar";
import Footer from "./Components/navigation/Footer";
import Dashboard from "./dashboard/page";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <Header />
        <Dashboard />
        <Feedhome />
        {/* <Home /> */}
        <Footer />
        {children}
      </body>
    </html>
  );
}

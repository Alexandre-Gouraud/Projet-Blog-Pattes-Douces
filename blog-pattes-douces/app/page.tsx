import Image from "next/image";
import Feedhome from "./Components/feed/Feedhome";
import Header from "./Components/navigation/Header";
import Navbar from "./Components/navigation/Navbar";
import Footer from "./Components/navigation/Footer";
import Navbar_connecte from "./Components/navigation/Navbar_connecte";


export default function App({ children }: { children: React.ReactNode }) {

  const navbar_aff = () => {
    if (localStorage.getItem("userId") != null) return <Navbar_connecte />;
    else return <Navbar />;
  };
  return (
    <html lang="fr">
      <body>
        {navbar_aff()}
        <Header />
        <Feedhome />
        {/* <Home /> */}
        <Footer />
        {children}
      </body>
    </html>
  );
}

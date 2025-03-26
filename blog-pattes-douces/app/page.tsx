import Image from "next/image";
import Feedhome from "./Components/feed/Feedhome";
import Navbar from "./Components/navigation/Navbar";
import Footer from "./Components/navigation/Footer";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <Feedhome />
        {/* <Home /> */}
        <Footer />
        {children}
      </body>
    </html>
  );
}

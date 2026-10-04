import Navbar from "@/components/layout/Navbar";
import Banner from "@/components/layout/Banner";
import Footer from "@/components/layout/Footer";
import ArticleFeed from "@/features/articles/components/ArticleFeed";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Banner />
      <ArticleFeed />
      <Footer />
    </>
  );
}

"use client";
import ComUser from "../Components/dispComUser";
import Footer from "../Components/navigation/Footer";
import Header from "../Components/navigation/Header";
import NavbarAff from "../Components/navigation/Navbar_aff";

const CommentPage = () => {
  return (
    <>
      <NavbarAff />
      <Header />
      <ComUser  />
      <Footer />
    </>
  );
}
export default CommentPage;
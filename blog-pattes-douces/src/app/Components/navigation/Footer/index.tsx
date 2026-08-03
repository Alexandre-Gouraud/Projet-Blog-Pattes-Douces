import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Contenu principal de la page */}
      <div className="flex-grow">
        {/* Ton contenu ici */}
      </div>

      {/* Footer */}
      <div className="footer bg-white w-full h-20 border-t border-gray-300">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-end items-center h-full">
            <ul className="hidden md:flex gap-x-6 text-gray-700">
              <li>
                <Link href="/about">
                  <p>À propos</p>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <p>Contact</p>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <p>Confidentialité</p>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <p>Conditions</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;

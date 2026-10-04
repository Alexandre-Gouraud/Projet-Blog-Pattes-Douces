"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { useIsLoggedIn } from "@/lib/auth/session";

/**
 * Navbar unique : les liens changent selon l'etat de connexion.
 * Remplace Navbar + Navbar_connecte + Navbar_aff, qui existaient en double
 * sous app/Components/navigation et app/layout/navigation.
 */
const Navbar = () => {
  const connected = useIsLoggedIn();

  const links = connected
    ? [
        { href: ROUTES.profile, label: "Profil" },
        { href: ROUTES.feed, label: "Feed" },
        { href: ROUTES.activity, label: "Activité" },
        { href: ROUTES.dashboard, label: "Dashboard" },
      ]
    : [
        { href: ROUTES.feed, label: "Accueil" },
        { href: ROUTES.login, label: "Se Connecter" },
        { href: ROUTES.feed, label: "Feed" },
        { href: ROUTES.activity, label: "Activité" },
        { href: ROUTES.dashboard, label: "Dashboard" },
      ];

  return (
    <div className="navbar">
      <div
        className="w-full h-20"
        style={{
          background:
            "linear-gradient(90deg, hsla(28, 38%, 43%, 1) 0%, hsla(0, 0%, 27%, 1) 100%)",
        }}
      >
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-end items-center h-full">
            <ul className="hidden md:flex items-center gap-x-6 text-white">
              {links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

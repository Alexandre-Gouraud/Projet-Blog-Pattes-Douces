"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Feed from "../Feed/page";
import Logo from "../assets/Pattes_Douces_logo.png";

const AppHeader: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gestion des raccourcis clavier pour la barre de recherche
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-[9999] w-full bg-[#E5E3DD]" >
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
      {/* Toggle Button & Logo */}
      <div className="flex items-center gap-4">
        {/* Menu toggle for smaller screens */}
        {/* <button
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        className="block lg:hidden p-2 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:focus:ring-gray-600"
        aria-label="Toggle Menu"
        >
        {isMobileMenuOpen ? (
          <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
          </svg>
        ) : (
          <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
          </svg>
        )}
        </button> */}

        {/* Logo */}
        <Link href="/Feed" className="flex items-center">
        <Image
          src={Logo}
          alt="Logo"
          width={64}
          height={64}
          className="dark:hidden"
        />
        <Image
          src={Logo}
          alt="Logo"
          width={64}
          height={64}
          className="hidden dark:block"
        />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="hidden lg:block lg:max-w-md w-full">
        <form className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search or type command..."
          className="w-full h-11 pl-12 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg shadow-sm dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <span className="absolute inset-y-0 left-4 flex items-center text-gray-500 dark:text-gray-400">
          <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          >
          <path
            fillRule="evenodd"
            d="M8 4a6 6 0 100 12 6 6 0 000-12zm-4 6a4 4 0 118 0 4 4 0 01-8 0z"
            clipRule="evenodd"
          />
          <path
            d="M12.9 14.32a8 8 0 111.414-1.414l3.518 3.518a1 1 0 01-1.414 1.414l-3.518-3.518z"
          />
          </svg>
        </span>
        <button
          type="button"
          className="absolute inset-y-0 right-4 text-sm text-gray-400 dark:text-gray-500"
        >
          ⌘ + K
        </button>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle Dark Mode"
        >
        {/* Toggle Button Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-600 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m8.364-6.364l-.707-.707m-14.95 0l-.707.707M21 12h-1m-16 0H3m8.364 8.364l-.707-.707m0-14.95l.707-.707"
          />
        </svg>
        </button>
        <button
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifications"
        >
        {/* Notifications Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-600 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 01-6 0"
          />
        </svg>
        </button>
        <button
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="User Menu"
        >
        {/* User Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-600 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5m-9 5l-9-5m9 5V6m0 8l-9-5l9 5z"
          />
        </svg>
        </button>
      </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
      <div className="block bg-[#E5E5E1] dark:bg-gray-900 lg:hidden">
        <Link href="/" className="block px-4 py-2 text-gray-700 dark:text-gray-300">
        Home
        </Link>
        <button className="block px-4 py-2 text-gray-700 dark:text-gray-300">
        Settings
        </button>
        <button className="block px-4 py-2 text-gray-700 dark:text-gray-300">
        Logout
        </button>
      </div>
      )}
    </header>
  );
};

export default AppHeader;

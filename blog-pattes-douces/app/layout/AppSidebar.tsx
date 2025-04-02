"use client";

import React, { useState } from "react";
import Link from "next/link";
import Feed from "../Feed/page";
import Profil from "../Profil/page";
import Dashboard from "../Components/dashboard";
import Activity from "../Components/activity/page";

import {
  HomeIcon,
  CalendarIcon,
  UserCircleIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentIcon,
  ChartBarSquareIcon,
  CubeIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  BookmarkSquareIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { href: "/Feed", icon: <HomeIcon className="h-6 w-6" />, label: "Accueil" },
    {
      href: "/Profil",
      icon: <UserCircleIcon className="h-6 w-6" />,
      label: "Profil",
    },
    // {
    //   href: "https://calendar.google.com/calendar",
    //   icon: <CalendarIcon className="h-6 w-6" />,
    //   label: "Calendrier",
    // },
    {
      href: "/Feed",
      icon: <DocumentDuplicateIcon className="h-6 w-6" />,
      label: "Articles",
    },
    {
      href: "/Activity",
      icon: <BookmarkSquareIcon className="h-6 w-6" />,
      label: "Activité et Historique",
    },
    // {
    //   href: "/feed",
    //   icon: <CubeIcon className="h-6 w-6" />,
    //   label: "Projets",
    // },
    {
      href: "/dashboard",
      icon: <ChartBarSquareIcon className="h-6 w-6" />,
      label: "Statistiques",
    },
    {
      href: "/Connexion",
      icon: <ArrowRightOnRectangleIcon className="h-6 w-6" />,
      label: "Se Connecter",
    },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-gray-800 h-screen fixed flex flex-col transition-all duration-300`}
    >
      {/* Header de la sidebar */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        {!collapsed && (
          <h1 className="text-white font-bold text-xl truncate">Pattes Douces</h1>
        )}
        {/* <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="h-6 w-6" />
          ) : (
            <ChevronDoubleLeftIcon className="h-6 w-6" />
          )}
        </button> */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 group"
              >
                <div className="text-gray-400 group-hover:text-white">
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="text-white text-sm">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer (optionnel) */}
      <footer className="px-4 py-4 border-t border-gray-700 mt-auto">
        {!collapsed && (
          <p className="text-gray-500 text-xs">&copy; 2025 Pattes Douces</p>
        )}
      </footer>
    </div>
  );
};

export default Sidebar;

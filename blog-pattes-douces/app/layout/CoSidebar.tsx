"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    HomeIcon,
    CalendarIcon,
    UserCircleIcon,
    DocumentDuplicateIcon,
    BookmarkSquareIcon,
    ChartBarSquareIcon,
    ArrowRightOnRectangleIcon,
    ChevronDoubleRightIcon,
    ChevronDoubleLeftIcon,
    ArrowLeftStartOnRectangleIcon
} from "@heroicons/react/24/outline";

const CoSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const handleLogout = () => {
        localStorage.removeItem("pseudo");
        localStorage.removeItem("user_id");
        window.location.href = "/Feed";
    };

    const menuItems = [
        { href: "/Feed", icon: <HomeIcon className="h-6 w-6" />, label: "Accueil" },
        {
            href: "/Profil",
            icon: <UserCircleIcon className="h-6 w-6" />,
            label: "Profil",
        },
        // {
        //     href: "https://calendar.google.com/calendar",
        //     icon: <CalendarIcon className="h-6 w-6" />,
        //     label: "Calendrier",
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
        {
            href: "/dashboard",
            icon: <ChartBarSquareIcon className="h-6 w-6" />,
            label: "Statistiques",
        },
        {
            onClick: handleLogout,
            icon: <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />,
            label: "Se Déconnecter",
        },
    ];

    return (
        <div
            className={`${
                collapsed ? "w-16" : "w-64"
            } bg-[#E5E5DF] h-screen fixed flex flex-col transition-all duration-300`}
        >
            {/* Header de la sidebar */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
                {!collapsed && (
                    <h1 className="text-black font-bold text-xl truncate">Pattes Douces</h1>
                )}
                {/* <button
                    onClick={toggleSidebar}
                    className="text-black-400 hover:text-white focus:outline-none"
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
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 group"
                                >
                                    <div className="text-black-400 group-hover:text-white">
                                        {item.icon}
                                    </div>
                                    {!collapsed && (
                                        <span className="text-black text-sm hover:text-white">{item.label}</span>
                                    )}
                                </Link>
                            ) : (
                                <button
                                    onClick={item.onClick}
                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 group w-full text-left"
                                >
                                    <div className="text-black-400 group-hover:text-white">
                                        {item.icon}
                                    </div>
                                    {!collapsed && (
                                        <span className="text-black text-sm hover:text-white">{item.label}</span>
                                    )}
                                </button>
                            )}
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

export default CoSidebar;

"use client";

import Link from "next/link";
import { useState } from "react";
import {
    HomeIcon,
    UserCircleIcon,
    DocumentDuplicateIcon,
    BookmarkSquareIcon,
    ChartBarSquareIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { ROUTES } from "@/lib/routes";
import { clearSession, useIsLoggedIn } from "@/lib/auth/session";

type MenuItem = {
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
};

/**
 * Sidebar unique : les memes entrees pour tout le monde, seule la derniere
 * change selon que l'utilisateur est connecte ou non.
 * Remplace AfficherSidebar + AppSidebar + CoSidebar.
 */
const Sidebar = () => {
    const [collapsed] = useState(false);
    const connected = useIsLoggedIn();

    const handleLogout = () => {
        clearSession();
        window.location.href = ROUTES.feed;
    };

    const menuItems: MenuItem[] = [
        { href: ROUTES.feed, icon: <HomeIcon className="h-6 w-6" />, label: "Accueil" },
        { href: ROUTES.profile, icon: <UserCircleIcon className="h-6 w-6" />, label: "Profil" },
        { href: ROUTES.feed, icon: <DocumentDuplicateIcon className="h-6 w-6" />, label: "Articles" },
        { href: ROUTES.activity, icon: <BookmarkSquareIcon className="h-6 w-6" />, label: "Activité et Historique" },
        { href: ROUTES.dashboard, icon: <ChartBarSquareIcon className="h-6 w-6" />, label: "Statistiques" },
        connected
            ? { onClick: handleLogout, icon: <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />, label: "Se Déconnecter" }
            : { href: ROUTES.login, icon: <ArrowRightOnRectangleIcon className="h-6 w-6" />, label: "Se Connecter" },
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
                                    <div className="text-gray-400 group-hover:text-black">{item.icon}</div>
                                    {!collapsed && <span className="text-black text-sm">{item.label}</span>}
                                </Link>
                            ) : (
                                <button
                                    onClick={item.onClick}
                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 group w-full text-left"
                                >
                                    <div className="text-gray-400 group-hover:text-black">{item.icon}</div>
                                    {!collapsed && <span className="text-black text-sm">{item.label}</span>}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <footer className="px-4 py-4 border-t border-gray-700 mt-auto">
                {!collapsed && <p className="text-gray-500 text-xs">&copy; 2025 Pattes Douces</p>}
            </footer>
        </div>
    );
};

export default Sidebar;

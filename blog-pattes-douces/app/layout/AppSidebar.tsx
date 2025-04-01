"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: "📊", name: "Dashboard", path: "/", subItems: null },
  { icon: "📅", name: "Calendar", path: "/calendar", subItems: null },
  { icon: "👤", name: "User Profile", path: "/profile", subItems: null },
  {
    icon: "📋",
    name: "Forms",
    subItems: [{ name: "Form Elements", path: "/form-elements" }],
  },
  {
    icon: "📁",
    name: "Tables",
    subItems: [{ name: "Basic Tables", path: "/basic-tables" }],
  },
  {
    icon: "📄",
    name: "Pages",
    subItems: [
      { name: "Blank Page", path: "/blank" },
      { name: "404 Error", path: "/error-404" },
    ],
  },
];

const othersItems = [
  {
    icon: "📈",
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart" },
      { name: "Bar Chart", path: "/bar-chart" },
    ],
  },
  {
    icon: "🔌",
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const pathname = usePathname();
  const submenuHeights = useRef<Record<number, number>>({}).current;

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  const renderMenuItems = (items: any[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={item.name} className="relative">
          {item.subItems ? (
            <>
              {/* Button for items with submenus */}
              <button
                className={`flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 rounded-lg transition-all duration-200 ease-in-out
                  ${
                    isExpanded ? "justify-start" : "justify-center"
                  } hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800`}
                onClick={() => handleSubmenuToggle(index)}
              >
                <span className="flex items-center">
                  <span className="mr-3">{item.icon}</span>
                  {isExpanded && item.name}
                </span>
                {isExpanded && (
                  <span
                    className={`ml-auto transform transition-all ${
                      openSubmenu === index ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                )}
              </button>

              {openSubmenu === index && (
                <ul
                  className="pt-2 pl-6 border-l border-gray-300 dark:border-gray-700"
                  style={{
                    maxHeight: submenuHeights[index] || "auto",
                  }}
                >
                  {item.subItems.map((subItem: any) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`block px-2 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          isActive(subItem.path)
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            // Link for items without submenus
            <Link
              href={item.path}
              className={`flex items-center w-full p-2 text-sm font-medium text-gray-700 rounded-lg transition-all duration-200 ease-in-out
                ${
                  isActive(item.path)
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-900"
                    : "hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              {isExpanded && item.name}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-800 transition-width duration-300 ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/">
          <Image
            src={isExpanded ? "/images/logo/logo.svg" : "/images/logo/logo-icon.svg"}
            alt="Logo"
            width={isExpanded ? 120 : 32}
            height={isExpanded ? 40 : 32}
          />
        </Link>
        {isExpanded && (
          <button
            className="p-2 text-gray-500 rounded-lg dark:text-gray-400"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "◀" : "▶"}
          </button>
        )}
      </div>

      {/* Menu Section */}
      <nav className="flex-1 mt-4 overflow-y-auto">
        <div>
          <h2 className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase">
            Menu
          </h2>
          {renderMenuItems(navItems)}
        </div>
        <div className="mt-6">
          <h2 className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase">
            Others
          </h2>
          {renderMenuItems(othersItems)}
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;

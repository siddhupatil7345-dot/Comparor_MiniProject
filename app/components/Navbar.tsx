"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { name: "Compare Lists", href: "/" },
  { name: "Compare Text", href: "/compare-text" },
  { name: "Text Fixer", href: "/text-fixer" },
  { name: "CSV Splitter", href: "/csv-splitter" },
  { name: "Text Columnizer", href: "/text-columnizer" },
  { name: "Column Extractor", href: "/column-extractor" },
  { name: "Json Diff", href: "/tools/json-diff" },
  { name: "Others", href: "/others" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand on the left side */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-blue-500 hover:text-blue-700 transition-colors"
          >
            Online Comparor
          </Link>

          {/* Nav links on the right */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out",
                    "hover:text-white hover:bg-blue-600",
                    isActive ? "bg-blue-500 text-white shadow-md" : "text-gray-800"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

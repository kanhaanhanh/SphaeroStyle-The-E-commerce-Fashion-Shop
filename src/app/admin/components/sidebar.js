// components/Sidebar.js

import {
  Home,
  Users,
  Percent,
  Package,
  LayoutGrid,
  List,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import Logo from "../../assets/Logo.png";

const navItems = [
  { name: "Dashboard", icon: <Home />, href: "/admin" },
  { name: "Staff Management", icon: <Users />, href: "/admin/staff" },
  // { name: "Promotions", icon: <Percent />, href: "/admin/promotions" },
  { name: "Products", icon: <Package />, href: "/admin/products" },
  { name: "Categories", icon: <LayoutGrid />, href: "/admin/categories" },
  { name: "Attributes", icon: <List />, href: "/admin/attributes" },
  { name: "Orders", icon: <Package />, href: "/admin/orders" },
];

export default function Sidebar({ currentPage }) {
  return (
    <aside className="h-screen bg-[#12372A] text-white w-[240px] flex flex-col justify-between rounded-l-2xl shadow-2xl">
      {/* Top section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1E4E3A]">
          <div className="w-10 h-10 relative">
            <Image
              src={Logo}
              alt="Logo"
              fill
              className="object-contain rounded-full"
            />
          </div>
          <h1 className="text-xl font-bold">SphaeroStyle</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-6 py-3 hover:bg-[#1E4E3A] transition-colors duration-300 rounded-l-full",
                currentPage === item.name && "bg-gradient-to-r from-stone-600 to-neutral-300 text-black"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-bold">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1E4E3A]">
        <Link
          href="/settings"
          className="flex items-center gap-3 hover:text-green-300 transition-colors duration-300"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">SETTING</span>
        </Link>
      </div>
    </aside>
  );
}

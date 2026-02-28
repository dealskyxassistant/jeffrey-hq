"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "⬡" },
  { href: "/agents", label: "Agenten", icon: "◈" },
  { href: "/tasks", label: "Tasks", icon: "◫" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-indigo-500/20 border border-indigo-500/40 rounded-lg flex items-center justify-center text-sm group-hover:bg-indigo-500/30 transition-colors">
              🧠
            </div>
            <span className="font-bold text-white text-sm tracking-tight">Jeffrey HQ</span>
            <span className="hidden sm:block text-gray-600 text-xs">· Mission Control</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    active
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loggingOut ? "..." : "Logout"}
          </button>
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [newCount, setNewCount] = useState(0);

  // Fetch inbox new count
  useEffect(() => {
    async function fetchNewCount() {
      try {
        const res = await fetch("/api/results");
        const data = await res.json() as Array<{ status: string }>;
        setNewCount(data.filter((r) => r.status === "new").length);
      } catch {
        // ignore
      }
    }
    void fetchNewCount();
    const interval = setInterval(() => void fetchNewCount(), 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: "⬡" },
    { href: "/agents", label: "Agenten", icon: "◈" },
    { href: "/pipeline", label: "Pipeline", icon: "🔗" },
    { href: "/jobs", label: "Jobs", icon: "🎯" },
    { href: "/inbox", label: "Inbox", icon: "📬", badge: newCount || undefined },
    { href: "/costs", label: "Costs", icon: "💰" },
    { href: "/tasks", label: "Tasks", icon: "◫" },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-7 h-7 bg-indigo-500/20 border border-indigo-500/40 rounded-lg flex items-center justify-center text-sm group-hover:bg-indigo-500/30 transition-colors">
              🧠
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">Jeffrey HQ</span>
            <span className="hidden sm:block text-gray-400 dark:text-gray-600 text-xs">· Mission Control</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                    active
                      ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="hidden sm:block">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

            {/* Analytics - Soon */}
            <span className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 dark:text-gray-600 cursor-not-allowed whitespace-nowrap">
              <span className="text-xs">📊</span>
              <span className="hidden sm:block">Analytics</span>
              <span className="hidden sm:block text-[9px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">Soon</span>
            </span>
          {/* Right: Theme Toggle + Logout */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={toggle}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              {loggingOut ? "..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

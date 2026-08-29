"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { 
  Printer, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Shield, 
  Lock, 
  ChevronDown, 
  Sun,
  Moon,
  Monitor,
  Check,
  Sparkles,
  Calculator,
} from "lucide-react";

type Theme = "light" | "dark" | "system";

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (t === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(saved);

    // Listen for system preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if ((localStorage.getItem("theme") || "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, [applyTheme]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (t: Theme) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
    setIsOpen(false);
  };

  const getIcon = () => {
    if (!mounted) return <Monitor className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    if (theme === "light") return <Sun className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light",  label: "Light",  icon: <Sun className="h-4 w-4 text-amber-500" /> },
    { value: "dark",   label: "Dark",   icon: <Moon className="h-4 w-4 text-indigo-400" /> },
    { value: "system", label: "System", icon: <Monitor className="h-4 w-4 text-zinc-500" /> },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
        title="Change theme"
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm backdrop-blur-sm"
      >
        <span className="transition-transform duration-300">
          {getIcon()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl shadow-black/10 dark:shadow-black/40 py-1.5 z-[60] overflow-hidden animate-[fadeSlideDown_0.15s_ease-out]">
          <p className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Appearance</p>
          {options.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors ${
                theme === value
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              }`}
            >
              {icon}
              <span>{label}</span>
              {theme === value && <Check className="h-3.5 w-3.5 ml-auto text-indigo-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, signIn, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickLoginOpen, setIsQuickLoginOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleQuickLogin = async (role: "customer" | "admin") => {
    try {
      if (role === "admin") {
        await signIn("admin@printhub.com", "admin123");
        router.push("/admin");
      } else {
        await signIn("customer@printhub.com", "password123");
        router.push("/dashboard");
      }
      setIsQuickLoginOpen(false);
    } catch (err) {
      console.error("Quick login failed:", err);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Price Calculator", href: "/pricecalculator", badge: "Live" },
    { name: "Services", href: "/services" },
    { name: "Custom Merch", href: "/customizer" },
    { name: "Pricing", href: "/pricing" },
    { name: "Track Order", href: "/track" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-[#07070a]/85 border-b border-zinc-200/80 dark:border-white/[0.08] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Printer className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-white leading-none">
                  SUVIR<span className="text-indigo-600 dark:text-indigo-400 font-semibold"> Printing</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Print & Merchandise Studio
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 ${
                    isActive 
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/15" 
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side: Theme Toggle + Instant CTA + Auth Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Order CTA */}
            <Link
              href="/customizer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Studio</span>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Separator */}
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

            {loading ? (
              <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] hover:border-indigo-500/40 text-sm font-semibold text-zinc-800 dark:text-zinc-100 transition shadow-sm"
                >
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full border border-indigo-500/30 object-cover"
                  />
                  <span className="truncate max-w-[120px]">{user.displayName}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#09090f] border border-zinc-200 dark:border-white/10 shadow-2xl shadow-black/20 py-2 z-50 text-zinc-700 dark:text-zinc-200 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-white/5">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Account</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate mt-0.5">{user.displayName}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === 'admin' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                      }`}>
                        {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </div>

                    <Link
                      href={user.role === "admin" ? "/admin" : "/dashboard"}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm font-medium hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2.5 text-indigo-500" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut();
                        router.push("/");
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm font-medium hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-t border-zinc-100 dark:border-white/5 mt-1 transition"
                    >
                      <LogOut className="h-4 w-4 mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                {/* Developer Quick Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsQuickLoginOpen(!isQuickLoginOpen)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Demo Login</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {isQuickLoginOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#09090f] border border-zinc-200 dark:border-white/10 shadow-2xl py-2 z-50 text-zinc-700 dark:text-zinc-200">
                      <div className="px-4 py-1.5 text-[10px] text-zinc-400 uppercase tracking-widest font-bold border-b border-zinc-100 dark:border-white/5 mb-1">
                        Select Demo Role
                      </div>
                      <button
                        onClick={() => handleQuickLogin("customer")}
                        className="w-full flex items-center px-4 py-2 text-left text-sm font-medium hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      >
                        <User className="h-4 w-4 mr-2 text-emerald-500" />
                        Customer Login
                      </button>
                      <button
                        onClick={() => handleQuickLogin("admin")}
                        className="w-full flex items-center px-4 py-2 text-left text-sm font-medium hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      >
                        <Shield className="h-4 w-4 mr-2 text-amber-500" />
                        Admin Login
                      </button>
                    </div>
                  )}
                </div>

                <Link
                  href="/login"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Theme + Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />

            {!user && !loading && (
              <button
                onClick={() => setIsQuickLoginOpen(!isQuickLoginOpen)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded border border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
              >
                <Lock className="w-3 h-3" />
                <span>Login</span>
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#07070a]/95 backdrop-blur-2xl py-4 px-4 space-y-2 animate-[fadeSlideDown_0.2s_ease-out]">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Link
              href="/pricecalculator"
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold text-center"
            >
              <Calculator className="h-4 w-4" />
              <span>Calculator</span>
            </Link>
            <Link
              href="/customizer"
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold text-center"
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>Studio</span>
            </Link>
            <Link
              href="/track"
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold text-center"
            >
              <Printer className="h-4 w-4 text-indigo-500" />
              <span>Track</span>
            </Link>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold" 
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          <div className="border-t border-zinc-100 dark:border-white/5 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/5">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
                    alt={user.displayName}
                    className="w-9 h-9 rounded-full border border-indigo-500/30 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard ({user.role === "admin" ? "Admin" : "Customer"})
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                    router.push("/");
                  }}
                  className="w-full text-center block py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Developer Quick Login */}
      {isQuickLoginOpen && !user && (
        <div className="md:hidden absolute right-4 top-17 w-52 rounded-2xl bg-white dark:bg-[#09090f] border border-zinc-200 dark:border-white/10 shadow-2xl py-2 z-50 text-zinc-700 dark:text-zinc-200">
          <div className="px-4 py-1.5 text-[10px] text-zinc-400 uppercase tracking-widest font-bold border-b border-zinc-100 dark:border-white/5 mb-1">
            Select Demo Role
          </div>
          <button
            onClick={() => handleQuickLogin("customer")}
            className="w-full flex items-center px-4 py-2 text-left text-sm font-medium hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <User className="h-4 w-4 mr-2 text-emerald-500" />
            Customer (Jane Doe)
          </button>
          <button
            onClick={() => handleQuickLogin("admin")}
            className="w-full flex items-center px-4 py-2 text-left text-sm font-medium hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <Shield className="h-4 w-4 mr-2 text-amber-500" />
            Admin (Viveka Jee)
          </button>
        </div>
      )}
    </nav>
  );
}

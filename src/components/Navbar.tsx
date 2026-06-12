"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaInstagram } from "react-icons/fa";
import UnifiedMobileDrawer from "@/components/UnifiedMobileDrawer";

const links = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "All Products" },
  { href: "/policy", label: "Our Story" },
];

export default function Navbar() {
  const { items } = useCart();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Sync user state with localStorage on every route change
  useEffect(() => {
    const storedUser =
      localStorage.getItem("ether_user") ||
      localStorage.getItem("ether_admin_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("ether_token");
    localStorage.removeItem("ether_user");
    localStorage.removeItem("ether_admin_token");
    localStorage.removeItem("ether_admin_user");
    setUser(null);
    router.push("/");
  };

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      {/* ── Top navbar (visible on all screens; desktop shows full links) ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex justify-between items-center">

          {/* Mobile hamburger — opens UnifiedMobileDrawer (hidden on desktop) */}
          <button
            className="md:hidden text-stone-800 hover:text-[#d4a84b] transition-colors p-2 -ml-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-stone-900 hover:opacity-70 transition-opacity absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
          >
            <span className="gold-gradient-text drop-shadow-sm">È T H E R</span>
          </Link>

          {/* Desktop nav links (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-12 absolute left-1/2 -translate-x-1/2">
            {links.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="relative text-sm font-medium tracking-wide transition-colors group py-2"
                >
                  <span
                    className={
                      isActive
                        ? "text-[#a07828]"
                        : "text-stone-600 group-hover:text-[#d4a84b]"
                    }
                  >
                    {l.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4a84b] to-transparent"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-6">
            {/* Instagram — desktop only */}
            <a
              href="https://www.instagram.com/etherbathandbody?igsh=Mm52eWI5anZxMmx5"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center justify-center text-stone-500 hover:scale-110 transition"
            >
              <FaInstagram size={20} className="hover:text-[#E1306C]" />
            </a>

            {/* User dropdown — desktop only */}
            {user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 text-stone-600 hover:text-[#d4a84b] transition-colors py-2">
                  <User size={20} strokeWidth={1.5} />
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-stone-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden">
                  <div className="p-4 border-b border-stone-100">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-stone-500 truncate">{user.email}</p>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block w-full text-left px-4 py-3 text-sm text-[#a07828] font-semibold hover:bg-[#f5e6c0]/20 transition-colors border-b border-stone-100"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold tracking-widest uppercase text-stone-500 hover:text-[#d4a84b] transition-colors hidden md:block"
              >
                Sign In
              </Link>
            )}

            {/* Cart — always visible */}
            <Link
              href="/cart"
              className="relative text-yellow-800 hover:text-[#d4a84b] transition-colors p-2 -mr-2 flex items-center gap-2"
              aria-label="Cart"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 bg-gradient-to-r from-[#d4a84b] to-[#a07828] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center leading-none shadow-md"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Unified mobile drawer (lg:hidden inside the component) ── */}
      <UnifiedMobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}

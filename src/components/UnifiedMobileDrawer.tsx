"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  LayoutDashboard,
  Users,
  Package,
  Tag,
  Film,
  Star,
  ShoppingCart,
  Ticket,
  Settings,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";

// ─── Route definitions ─────────────────────────────────────────────────────────

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "All Products" },
  { href: "/policy", label: "Our Story" },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/videos", label: "Videos", icon: Film },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: Ticket },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface UnifiedMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name?: string; email?: string; role?: string } | null;
  onLogout: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Unified mobile-only sidebar drawer (hidden on lg+ screens).
 * Merges public navigation, admin management links, and account actions
 * into a single slide-in panel triggered from either the public navbar
 * or the admin mobile header.
 */
export default function UnifiedMobileDrawer({
  isOpen,
  onClose,
  user,
  onLogout,
}: UnifiedMobileDrawerProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAdmin = user?.role === "admin";
  const showManagement = isAdmin && isAdminRoute;

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    // Only rendered on mobile — md:hidden is applied to both backdrop and panel
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ────────────────────────────────── */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 md:hidden"
            onClick={onClose}
          />

          {/* ── Drawer panel ────────────────────────────── */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#faf8f5] z-50 flex flex-col md:hidden border-r border-[#d4a84b]/20 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200/60 bg-white/60 backdrop-blur-md flex-shrink-0">
              <span className="font-serif text-xl gold-gradient-text drop-shadow-sm">
                È T H E R
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-1">

              {/* ── Section 1: Navigation ── */}
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-bold mb-3 px-1">
                Navigation
              </p>
              <nav className="flex flex-col gap-0.5">
                {publicLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`block px-3 py-2.5 rounded-xl text-base font-serif transition-colors ${
                        pathname === link.href
                          ? "text-[#a07828] bg-[#f5e6c0]/40"
                          : "text-stone-800 hover:text-[#d4a84b] hover:bg-stone-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* ── Divider ── */}
              <div className="border-t border-stone-200 !my-5" />

              {/* ── Section 2: Management (admin only on admin routes) ── */}
              {showManagement && (
                <>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-bold mb-3 px-1">
                    Management
                  </p>
                  <nav className="flex flex-col gap-0.5">
                    {adminLinks.map((item, i) => {
                      const isActive = pathname === item.href;
                      return (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.04 }}
                        >
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-[#f5e6c0]/40 text-[#a07828]"
                                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                            }`}
                          >
                            <item.icon
                              size={17}
                              className={isActive ? "text-[#d4a84b]" : "text-stone-400"}
                            />
                            {item.label}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  {/* ── Divider ── */}
                  <div className="border-t border-stone-200 !my-5" />
                </>
              )}

              {/* ── Section 3: Account ── */}
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-bold mb-3 px-1">
                Account
              </p>

              {user ? (
                <div className="flex flex-col gap-3">
                  {/* User card */}
                  <div className="px-4 py-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  {/* Admin dashboard shortcut */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="w-full py-3 text-center bg-gradient-to-r from-[#d4a84b] to-[#a07828] text-white rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-yellow-900/10"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {/* Sign out */}
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 text-center border border-red-200 text-red-600 rounded-2xl text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="w-full py-3 text-center border border-stone-200 rounded-2xl text-stone-800 text-sm font-medium hover:bg-stone-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={onClose}
                    className="w-full py-3 text-center bg-stone-900 text-white rounded-2xl text-sm font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-5 bg-white border-t border-stone-200/60">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">
                Follow Us
              </p>
              <a
                href="https://www.instagram.com/etherbathandbody?igsh=Mm52eWI5anZxMmx5"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-stone-700 hover:text-[#d4a84b] font-medium transition-colors"
              >
                <FaInstagram size={16} />
                etheratelier2026
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

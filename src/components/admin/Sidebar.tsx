"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  ShoppingCart,
  Ticket,
  Settings,
  LogOut,
  Film,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Categories', icon: Tag, href: '/admin/categories' },
  { label: 'Videos', icon: Film, href: '/admin/videos' },
  { label: 'Reviews', icon: Star, href: '/admin/reviews' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Promo Codes', icon: Ticket, href: '/admin/promo-codes' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

/**
 * Admin left sidebar — desktop only (hidden on mobile via `hidden md:flex`).
 * Mobile navigation is handled by UnifiedMobileDrawer instead.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('ether_admin_token');
    localStorage.removeItem('ether_admin_user');
    localStorage.removeItem('ether_token');
    localStorage.removeItem('ether_user');
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-72 h-full bg-white border-r border-stone-100 sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="p-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4a84b] to-[#a07828] flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
            E
          </div>
          <span className="font-serif text-2xl tracking-tight text-stone-900">
            Ether<span className="text-[#d4a84b]">.</span>
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold px-4 mb-4">
          Management
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group',
                isActive
                  ? 'bg-[#f5e6c0]/40 text-[#a07828] shadow-sm'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={20}
                  className={cn(
                    'transition-colors',
                    isActive
                      ? 'text-[#d4a84b]'
                      : 'text-stone-400 group-hover:text-stone-600'
                  )}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="w-1.5 h-1.5 rounded-full bg-[#d4a84b]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-stone-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
        >
          <LogOut
            size={20}
            className="text-stone-400 group-hover:text-red-500 transition-colors"
          />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

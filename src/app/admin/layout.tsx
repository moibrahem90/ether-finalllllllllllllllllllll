"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import UnifiedMobileDrawer from '@/components/UnifiedMobileDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('ether_admin_token');
    const user = JSON.parse(localStorage.getItem('ether_admin_user') || '{}');

    if (!token || user.role !== 'admin') {
      localStorage.removeItem('ether_admin_token');
      localStorage.removeItem('ether_admin_user');
      window.location.href = '/not-found';
    } else {
      setIsAuthorized(true);
      setAdminUser(user);
    }
  }, [pathname]);

  // Auto-close drawer on navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('ether_token');
    localStorage.removeItem('ether_user');
    localStorage.removeItem('ether_admin_token');
    localStorage.removeItem('ether_admin_user');
    router.push('/login');
  };

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf8f5]">
        <div className="w-12 h-12 border-4 border-[#d4a84b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8f5] md:pt-20">

      {/* ── Desktop sidebar — hidden on mobile, always visible on md+ ── */}
      <Sidebar />

      {/* ── Main content column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile-only slim header with hamburger (md:hidden) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-100 sticky top-0 z-30 flex-shrink-0">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 -ml-1 rounded-xl text-stone-500 hover:bg-[#f5e6c0]/40 hover:text-[#a07828] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-serif text-lg tracking-tight text-stone-900">
            Ether<span className="text-[#d4a84b]">.</span>
          </span>
          {adminUser?.name && (
            <span className="ml-auto text-xs text-stone-400 font-medium truncate max-w-[120px]">
              {adminUser.name}
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-12 px-6 sm:px-10 pt-6 md:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Unified mobile drawer — opens via hamburger (lg:hidden inside component) ── */}
      <UnifiedMobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        user={adminUser}
        onLogout={handleLogout}
      />
    </div>
  );
}

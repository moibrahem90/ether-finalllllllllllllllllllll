"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Navbar from '@/components/admin/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('ether_admin_token');
    const user = JSON.parse(localStorage.getItem('ether_admin_user') || '{}');

    if (!token || user.role !== 'admin') {
      localStorage.removeItem('ether_admin_token');
      localStorage.removeItem('ether_admin_user');
      window.location.href = '/not-found';
    } else {
      setIsAuthorized(true);
    }
  }, [pathname]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf8f5]">
        <div className="w-12 h-12 border-4 border-[#d4a84b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto pt-20 pb-12 px-6 sm:px-10">
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
    </div>
  );
}

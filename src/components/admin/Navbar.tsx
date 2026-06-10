"use client";

import { User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('ether_admin_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-stone-100 fixed top-0 right-0 left-0 lg:left-72 z-40 px-6 sm:px-10 flex items-center justify-end">
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-stone-800">{user?.name || 'Admin User'}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#a07828] font-bold">Administrator</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f5e6c0] to-[#d4a84b] p-0.5 shadow-md">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            <User size={20} className="text-[#a07828]" />
          </div>
        </div>
      </div>
    </header>
  );
}

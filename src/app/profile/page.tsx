"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useEffect } from 'react';
import { User, Mail, Save, Loader2, LogOut, ShieldCheck, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Protect route
  useEffect(() => {
    const token = localStorage.getItem('ether_token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/user/profile');
      return res.data.data;
    },
    retry: false
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name);
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (newName: string) => api.patch('/user/profile', { name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('ether_token');
    localStorage.removeItem('ether_user');
    localStorage.removeItem("ether_admin_token");
    localStorage.removeItem("ether_admin_user");
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="animate-spin text-[#d4a84b]" size={40} />
      </div>
    );
  }

  const initials = name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] pt-36 pb-24 relative overflow-hidden flex items-center justify-center">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-[#f5e6c0]/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#e8e0f0]/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="text-center md:text-left">
            <span className="text-xs uppercase tracking-[0.3em] text-[#a07828] font-bold block mb-2">
              Customer Account
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-stone-800">
              Personal <span className="gold-gradient-text">Profile</span>
            </h1>
            <p className="text-stone-400 text-sm mt-2 font-light">
              Manage your personal identification, security, and account preferences.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Top Visual Banner / Avatar */}
            <div className="h-32 bg-gradient-to-r from-[#f5e6c0]/40 to-[#d4a84b]/20 relative flex items-end justify-center md:justify-start px-10 pb-0">
              <div className="translate-y-1/2 relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#f5e6c0] to-[#d4a84b] p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#a07828] font-bold text-3xl font-serif">
                    {initials}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-16 p-8 sm:p-10 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 border-b border-stone-100 pb-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-serif text-stone-800">{name || 'Ether User'}</h2>
                  <p className="text-stone-400 text-sm mt-0.5">{profile?.email}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5e6c0]/40 border border-[#d4a84b]/20 text-[#a07828] text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  Verified Account
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-[#d4a84b] transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-100 text-stone-800 text-sm rounded-2xl focus:bg-white focus:border-[#d4a84b] pl-11 p-4 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 ml-1">
                    Email Address
                  </label>
                  <div className="relative group opacity-60">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ''}
                      className="w-full bg-stone-50 border border-stone-100 text-stone-500 text-sm rounded-2xl pl-11 p-4 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-stone-400 text-xs ml-1">
                  <Calendar size={14} />
                  <span>Member since: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
                </div>

                {/* Toast message inside card */}
                <AnimatePresence>
                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="text-emerald-600 text-sm bg-emerald-50 p-4 rounded-xl border border-emerald-100"
                    >
                      {successMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Controls */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-stone-100">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 bg-stone-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 disabled:bg-stone-300"
                  >
                    {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Details
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 bg-red-50 text-red-600 font-bold py-4 rounded-2xl transition-all hover:bg-red-100 flex items-center justify-center gap-2 border border-red-100"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

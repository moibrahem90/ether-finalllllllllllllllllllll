"use client";

import { useState } from 'react';
import { Mail, KeyRound, Loader2, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any } }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Simulate/perform change password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-serif text-4xl text-stone-800 mb-3">Portal <span className="gold-gradient-text">Settings</span></h1>
        <p className="text-stone-500 text-sm max-w-xl leading-relaxed">Configure security settings and credentials for your administrative workspace.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Profile Card */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f5e6c0]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
          <div className="p-8 sm:p-10 flex flex-col md:flex-row items-center gap-10">
            <div>
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#f5e6c0] to-[#d4a84b] p-1 shadow-lg shadow-yellow-900/10">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#a07828] font-bold text-4xl overflow-hidden">
                  A
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-serif text-3xl text-stone-800 mb-2">Administrator</h2>
              <p className="text-stone-500 text-sm mb-6 flex items-center justify-center md:justify-start gap-2">
                <Mail size={14} className="text-stone-400" /> admin@ether.com
              </p>
              <div>
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="bg-stone-900 text-white px-7 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center gap-2 shadow-lg shadow-stone-900/10 hover:shadow-stone-900/20"
                >
                  <KeyRound size={14} /> {showForm ? 'Hide Form' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Change Password Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-[2rem] border border-stone-100 p-8 shadow-sm">
                <h3 className="font-serif text-2xl text-stone-800 mb-6">Update Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-emerald-600 text-sm bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-2">
                      <Check size={16} />
                      Password updated successfully!
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-stone-900 text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 disabled:bg-stone-300 transition-all flex items-center gap-2 shadow-lg shadow-stone-200"
                    >
                      {loading && <Loader2 size={14} className="animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

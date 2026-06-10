"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";

import api from "@/lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      const { token, user } = res.data.data;

      localStorage.setItem("ether_token", token);
      localStorage.setItem("ether_user", JSON.stringify(user));

      if (user.role === 'admin') {
        localStorage.setItem("ether_admin_token", token);
        localStorage.setItem("ether_admin_user", JSON.stringify(user));
        window.location.href = "/admin";
      } else {
        localStorage.removeItem("ether_admin_token");
        localStorage.removeItem("ether_admin_user");
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6 py-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[60%] bg-[#d4a84b]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[60%] bg-[#a07828]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="font-serif text-3xl gold-gradient-text">È T H E R</span>
          </motion.div>
          <h1 className="text-3xl font-serif text-stone-900 mb-2">Welcome Back</h1>
          <p className="text-stone-500 font-light">Sign in to your account to continue</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-[#d4a84b] transition-colors">
                  <Mail size={18} strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-2xl focus:ring-2 focus:ring-[#d4a84b]/20 focus:border-[#d4a84b] block w-full pl-11 p-4 transition-all outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#a07828] hover:text-[#d4a84b] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-[#d4a84b] transition-colors">
                  <Lock size={18} strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-2xl focus:ring-2 focus:ring-[#d4a84b]/20 focus:border-[#d4a84b] block w-full pl-11 pr-11 p-4 transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 group hover:bg-[#a07828] transition-all duration-500 shadow-lg shadow-stone-900/10 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-stone-100 text-center">
            <p className="text-stone-500 text-sm">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#a07828] font-semibold hover:text-[#d4a84b] transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

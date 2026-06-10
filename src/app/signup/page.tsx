"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    cpassword: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      cpassword: formData.cpassword,
    };

    try {
      await api.post("/auth/register", payload);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || err.message || "Something went wrong";
      if (err.response?.data?.errors?.length > 0) {
        errorMessage = err.response.data.errors.map((e: any) => e.message).join(", ");
      }
      
      if (errorMessage.toLowerCase().includes("phone")) {
        errorMessage = "Please enter valid phone";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-2xl focus:ring-2 focus:ring-[#d4a84b]/20 focus:border-[#d4a84b] pl-11 p-4 transition-all outline-none";

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6 py-24 relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[60%] bg-[#d4a84b]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[60%] bg-[#a07828]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="font-serif text-3xl gold-gradient-text">È T H E R</span>
          </motion.div>
          <h1 className="text-3xl font-serif text-stone-900 mb-2">
            Create Account
          </h1>
          <p className="text-stone-500 font-light">
            Join us and start your journey today
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 transition-colors duration-500">

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <p className="font-serif text-xl text-stone-800">Account Created!</p>
                <p className="text-stone-500 text-sm text-center leading-relaxed">
                  Welcome, <span className="font-semibold text-stone-700">{formData.name}</span>!<br />
                  Your account is ready. Redirecting to login...
                </p>
                <p className="text-stone-400 text-xs">Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-[#d4a84b] transition-colors">
                    <User size={18} strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={update("name")}
                    className={inputClass}
                    placeholder="John Doe"
                    minLength={3}
                  />
                </div>
              </div>

              {/* Email */}
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
                    onChange={update("email")}
                    className={inputClass}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2 ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-[#d4a84b] transition-colors">
                    <User size={18} strokeWidth={1.5} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={update("phone")}
                    className={inputClass}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-[#d4a84b] transition-colors">
                    <Lock size={18} strokeWidth={1.5} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={update("password")}
                    className={`${inputClass} pr-11`}
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <p className="mt-2 ml-1 text-[10px] text-stone-400 uppercase tracking-wider font-medium">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2 ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-[#d4a84b] transition-colors">
                    <Lock size={18} strokeWidth={1.5} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.cpassword}
                    onChange={update("cpassword")}
                    className={`${inputClass} pr-11`}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center font-medium bg-red-50 py-3 px-4 rounded-2xl border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all duration-500 shadow-lg mt-2 disabled:opacity-70 bg-stone-900 hover:bg-[#a07828] shadow-stone-900/10"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-stone-100 text-center">
            <p className="text-stone-500 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#a07828] font-semibold hover:text-[#d4a84b] transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-stone-400 font-light max-w-xs mx-auto">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-stone-600">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-stone-600">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}

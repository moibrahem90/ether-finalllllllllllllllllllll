"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] bg-[#d4a84b]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[60%] bg-[#a07828]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl text-center relative z-10">
        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <span className="font-serif text-[10rem] md:text-[14rem] leading-none gold-gradient-text opacity-20 select-none block">
            404
          </span>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6 -mt-12"
        >
          <span className="font-serif text-2xl gold-gradient-text">È T H E R</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-stone-500 font-light text-lg mb-10 leading-relaxed max-w-md mx-auto">
            The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 group bg-stone-900 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-500 shadow-lg shadow-stone-900/10 hover:bg-[#a07828]"
            >
              Return Home
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-white text-stone-700 font-medium py-4 px-8 rounded-2xl border border-stone-200 transition-all duration-500 hover:bg-stone-50 shadow-sm"
            >
              <Search size={18} />
              Browse Products
            </Link>
          </div>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 h-px w-24 bg-gradient-to-r from-transparent via-[#d4a84b]/40 to-transparent mx-auto"
        />
      </div>
    </div>
  );
}

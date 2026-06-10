"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const parallax = parallaxRef.current;
    if (!container || !parallax) return;

    // --- Mouse parallax (creamy, slow, smooth) ---
    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    }

    function animateParallax() {
      mouseRef.current.tx += (mouseRef.current.x - mouseRef.current.tx) * 0.035;
      mouseRef.current.ty += (mouseRef.current.y - mouseRef.current.ty) * 0.035;

      const maxShift = 25;
      if (parallax) {
        parallax.style.transform = `translate(${mouseRef.current.tx * maxShift}px, ${mouseRef.current.ty * maxShift}px) scale(1.05)`;
      }
      rafRef.current = requestAnimationFrame(animateParallax);
    }

    container.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(animateParallax);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
     <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#faf8f5]"
    >
      {/* Parallax wrapper */}
      <div ref={parallaxRef} className="absolute inset-[-5%] w-[110%] h-[110%]">
        {/* We use a standard img tag here to prevent Next.js from throwing hard 500 errors if the image file is missing while you are testing */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/photos/handmade-soap-almond-marble-background.jpg"
          alt="Natural Spa Products"
          className="object-cover object-center w-full h-full"
        />
        {/* Soft overlay gradient to make text stand out beautifully */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5] via-[#faf8f5]/20 to-transparent" />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Text overlay — centered in the frame */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pb-12 pointer-events-none px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <p
            className="text-xs md:text-sm uppercase tracking-[0.4em] mb-5 font-bold drop-shadow-md"
            style={{ color: "#a07828" }}
          >
            Handmade · Natural · Irvine, California
          </p>
          <h1
            className="font-serif text-stone-900 mb-6 leading-none drop-shadow-xl font-bold"
            style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)", letterSpacing: "-0.02em" }}
          >
            <span className="gold-gradient-text drop-shadow-sm">È T H E R</span>{" "}
          </h1>
          <p className="text-base md:text-xl text-stone-900 font-semibold mb-10 max-w-sm md:max-w-md leading-relaxed drop-shadow-md">
            Handcrafted natural soaps & candles with relaxing botanical scents.
          </p>
          <div className="pointer-events-auto flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="btn-gold inline-block px-10 py-4 rounded-full text-sm md:text-base font-bold tracking-wide shadow-lg"
            >
              Explore Collection
            </Link>
            <Link
              href="/policy"
              className="inline-block border-2 border-stone-800 text-stone-900 px-8 py-4 rounded-full text-sm md:text-base font-bold hover:bg-stone-900 hover:text-white transition-all duration-300 bg-white/70 backdrop-blur-md shadow-lg"
            >
              Our Story
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2 text-stone-800 font-semibold text-[10px] tracking-[0.2em] uppercase drop-shadow-sm"
      >
        <span>Scroll</span>
        <div className="w-[2px] h-10 overflow-hidden relative bg-stone-300/60 rounded-full">
          <div
            className="absolute top-0 left-0 w-full bg-[#d4a84b]"
            style={{ height: "50%", animation: "slideDown 1.5s ease-in-out infinite" }}
          />
        </div>
      </motion.div>

      <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
}

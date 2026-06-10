"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { Sparkles, Smartphone, CreditCard, Package, ExternalLink } from "lucide-react";

const steps = [
  { icon: Smartphone, title: "Watch for a DM", desc: "We'll message you on Instagram shortly." },
  { icon: CreditCard, title: "Pay via Zelle", desc: "Secure manual payment after confirmation." },
  { icon: Package, title: "Fast Shipping", desc: "Your order ships within 1–2 business days." },
];

export default function SuccessPage() {
  const circleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(circleRef.current, { scale: 0, opacity: 0, rotate: -45 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.2, ease: "back.out(1.5)" })
      .fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.6"
      );
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#f5e6c0]/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-2xl w-full text-center relative z-10 mt-16">

        {/* Animated ring */}
        <div ref={circleRef} className="w-32 h-32 mx-auto mb-10 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#d4a84b]/20 to-[#f5e6c0]/40 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full border border-[#d4a84b]/30 animate-[spin_10s_linear_infinite]" />
          <div className="relative w-full h-full rounded-full bg-white border border-white shadow-[0_20px_40px_rgba(212,168,75,0.15)] flex items-center justify-center">
            <Sparkles className="text-[#d4a84b]" size={40} strokeWidth={1.5} />
          </div>
        </div>

        <div ref={contentRef}>
          <p className="text-xs uppercase tracking-[0.4em] text-[#a07828] mb-5 font-semibold">
            Order Received
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-stone-800 mb-6 leading-tight">
            Your order smells<br />
            <span className="gold-gradient-text">amazing</span> already.
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed mb-12 max-w-md mx-auto font-light">
            We&apos;ve received your request. Check your Instagram for a message from us — we&apos;ll confirm your order and send a Zelle payment link.
          </p>

          {/* Info card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-8 md:p-10 mb-12 text-left max-w-lg mx-auto"
          >
            <div className="space-y-6">
              {steps.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#f5e6c0]/30 flex items-center justify-center flex-shrink-0 border border-[#d4a84b]/20 shadow-sm text-[#a07828]">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-stone-800 font-medium mb-1">{title}</h4>
                    <p className="text-stone-500 text-sm font-light">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="btn-gold px-10 py-4.5 rounded-full font-semibold shadow-[0_8px_30px_rgba(212,168,75,0.25)] flex items-center justify-center gap-2"
            >
              Continue Shopping
            </Link>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-stone-200 text-stone-700 px-10 py-4.5 rounded-full font-medium hover:border-[#d4a84b] hover:text-[#d4a84b] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} strokeWidth={1.5} />
              Open Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

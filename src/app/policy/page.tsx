"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PolicyPage() {
  return (
    <div className="w-full min-h-screen bg-[#faf8f5] py-32 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#f5e6c0]/30 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-[#e8e0f0]/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 sm:px-10 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-[#a07828] mb-6 block font-semibold">
            Information
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-stone-800 mb-8">
            Shipping & <span className="gold-gradient-text">Returns</span>
          </h1>
          <p className="text-stone-500 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our local delivery, handmade process, and order policies.
          </p>
        </motion.div>

        <div className="space-y-12">
          
          {/* Policy Section 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-10 md:p-14"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-[#f5e6c0]/40 flex items-center justify-center text-[#d4a84b] text-2xl">📦</span>
              <h2 className="font-serif text-3xl text-stone-800">Local Shipping</h2>
            </div>
            <div className="space-y-4 text-stone-600 font-light leading-relaxed">
              <p>
                We currently offer local delivery exclusively within <strong>Irvine, California</strong> and surrounding Orange County areas.
              </p>
              <p>
                Because our products are handcrafted in small batches, please allow <strong>1–2 business days</strong> for order processing and delivery. We personally ensure your items arrive safely and beautifully packaged.
              </p>
            </div>
          </motion.div>

          {/* Policy Section 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-10 md:p-14"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-[#f5e6c0]/40 flex items-center justify-center text-[#d4a84b] text-2xl">💳</span>
              <h2 className="font-serif text-3xl text-stone-800">Payment Process</h2>
            </div>
            <div className="space-y-4 text-stone-600 font-light leading-relaxed">
              <p>
                To maintain a personal connection with our community and avoid high transaction fees, we use a manual payment system via <strong>Zelle</strong>.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-stone-500">
                <li>Place your order through our website checkout.</li>
                <li>We will review your order and send you a Direct Message on Instagram.</li>
                <li>Once confirmed, we will provide our Zelle details.</li>
                <li>Your order will be dispatched immediately upon receipt of payment.</li>
              </ul>
            </div>
          </motion.div>

          {/* Policy Section 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-10 md:p-14"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-[#f5e6c0]/40 flex items-center justify-center text-[#d4a84b] text-2xl">🌿</span>
              <h2 className="font-serif text-3xl text-stone-800">Returns & Refunds</h2>
            </div>
            <div className="space-y-4 text-stone-600 font-light leading-relaxed">
              <p>
                We want you to completely love your Pure Earth creations. If you are unsatisfied with your purchase, we offer full refunds or exchanges within <strong>14 days</strong> of delivery.
              </p>
              <p>
                Due to the natural and personal nature of our products, items must be unused and in their original packaging to qualify for a return. Please contact us on Instagram to initiate a return.
              </p>
            </div>
          </motion.div>

        </div>

        <div className="mt-20 text-center">
          <Link href="/products" className="btn-gold px-10 py-4.5 rounded-full font-semibold shadow-xl inline-block">
            Return to Shop
          </Link>
        </div>

      </div>
    </div>
  );
}

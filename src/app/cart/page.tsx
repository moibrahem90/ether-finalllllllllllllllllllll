"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight, CreditCard, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import api from "@/lib/api";

function QuantityControl({ item }: { item: any }) {
  const { updateQuantity } = useCart();
  const [stockError, setStockError] = useState(false);

  const handleChange = async (val: number) => {
    const qty = Math.max(1, val);
    // Validate against live stock
    try {
      const res = await api.get(`/product/${item.id}`);
      const stock: number = res.data?.data?.stock ?? Infinity;
      if (qty > stock) {
        setStockError(true);
        setTimeout(() => setStockError(false), 3000);
        return;
      }
    } catch {
      // If we can't reach the API, proceed without validation
    }
    setStockError(false);
    updateQuantity(item.id, qty);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="inline-flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-full px-4 py-1.5 shadow-sm">
        <span className="text-stone-600 text-xs font-semibold">${item.price}</span>
        <span className="text-stone-200">|</span>
        <label className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Qty:</label>
        <input
          type="number"
          min={1}
          max={99}
          value={item.quantity}
          onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
          className="w-10 text-center text-stone-800 text-sm font-semibold focus:outline-none bg-transparent"
        />
      </div>
      {stockError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-rose-500 text-[10px] font-semibold flex items-center gap-1 ml-1"
        >
          <AlertCircle size={11} /> Requested quantity exceeds available stock.
        </motion.p>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items, removeFromCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#faf8f5] px-4 text-center relative overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-[#f5e6c0]/40 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-white border border-[#d4a84b]/20 shadow-[0_8px_30px_rgba(212,168,75,0.1)] flex items-center justify-center mb-8">
            <ShoppingBag className="text-[#d4a84b]" size={36} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-4">Your cart is empty</h1>
          <p className="text-stone-500 mb-10 max-w-sm text-lg font-light leading-relaxed">
            You haven&apos;t added any handmade creations yet. Let&apos;s change that.
          </p>
          <Link
            href="/products"
            className="btn-gold px-10 py-4 rounded-full text-base font-semibold shadow-xl flex items-center gap-2 group"
          >
            Browse Collection
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] py-32 relative overflow-hidden">
      <div className="absolute top-[10%] right-[-5%] w-[40vw] h-[40vw] bg-[#f5e6c0]/40 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 sm:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Link href="/products" className="text-sm font-medium text-stone-400 hover:text-[#d4a84b] transition-colors">
              ← Continue Shopping
            </Link>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-800 mb-12">
            Your <span className="gold-gradient-text">Cart</span>
          </h1>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Items */}
            <ul className="divide-y divide-stone-100">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.li 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0, padding: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-6 p-8 hover:bg-stone-50/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-white to-[#f5f0ea] border border-stone-100 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={90}
                        height={90}
                        className="object-contain mix-blend-multiply drop-shadow-md"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0 text-center sm:text-left">
                      <p className="font-serif text-xl text-stone-800 truncate mb-1">{item.name}</p>
                      <p className="text-stone-400 text-sm font-light mb-3">{item.scent}</p>
                      
                      {/* Quantity input controls with live stock validation */}
                      <QuantityControl item={item} />
                    </div>

                    {/* Price + Delete */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 flex-shrink-0 mt-4 sm:mt-0">
                      <p className="text-stone-800 font-medium text-xl">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-300 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50 border border-transparent hover:border-rose-100"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* Footer */}
            <div className="p-8 sm:p-10 bg-gradient-to-b from-stone-50/50 to-stone-100/30 border-t border-stone-100">
              
              {/* Payment Note */}
              <div className="flex items-start gap-4 bg-white border border-[#d4a84b]/20 rounded-2xl p-5 mb-8 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#f5e6c0]/30 flex items-center justify-center flex-shrink-0 text-[#d4a84b]">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-stone-800 mb-1">Manual Payment via Zelle</h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-light">
                    After placing your order, we&apos;ll contact you directly on Instagram to confirm the details and send a secure Zelle payment request.
                  </p>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-8 px-2">
                <div className="flex justify-between text-stone-500 text-base font-light">
                  <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span className="font-medium text-stone-700">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-base font-light">
                  <span>Shipping</span>
                  <span className="text-[#a07828] font-medium text-sm">Calculated on confirmation</span>
                </div>
                <div className="flex justify-between items-end pt-5 border-t border-stone-200 mt-2">
                  <span className="text-stone-500 text-sm font-medium uppercase tracking-widest">Estimated Total</span>
                  <span className="text-3xl font-serif text-stone-900">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="btn-gold w-full flex justify-center items-center gap-2 py-4.5 py-[18px] rounded-full text-lg font-semibold shadow-xl"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

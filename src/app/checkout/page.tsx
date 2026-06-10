"use client";

import { useCart } from "@/context/CartContext";
import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle2, Mail } from "lucide-react";
import api from "@/lib/api";

type Field = "fullName" | "email" | "phone" | "instagram" | "address";
type Step = "form" | "otp";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState<Record<Field, string>>({
    fullName: "",
    email: "",
    phone: "",
    instagram: "",
    address: "",
  });

  // ── Step management ──────────────────────────────────────────────
  const [step, setStep] = useState<Step>("form");
  const [orderId, setOrderId] = useState("");

  // ── Form state ───────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── OTP state ────────────────────────────────────────────────────
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange =
    (field: Field) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Place Order ──────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { setError("Your cart is empty."); return; }
    if (!form.fullName || !form.email || !form.phone || !form.instagram) {
      setError("Please fill out all mandatory fields.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      // ── Stock validation before placing order ───────────────────
      for (const item of items) {
        try {
          const res = await api.get(`/product/${item.id}`);
          const stock: number = res.data?.data?.stock ?? Infinity;
          if (item.quantity > stock) {
            setError("The requested quantity exceeds available stock. Please update your cart before proceeding.");
            setIsSubmitting(false);
            return;
          }
        } catch {
          // If individual product lookup fails, let the server validate
        }
      }

      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        instagramUsername: form.instagram,
        address: form.address,
        products: items.map((item) => ({ product: item.id, quantity: item.quantity })),
        totalPrice: total,
      };
      const res = await api.post("/order", payload);
      setOrderId(res.data.data._id);
      setStep("otp");
    } catch (err: any) {
      const data = err.response?.data;
      let errorMessage = data?.message || "Something went wrong creating your order.";
      
      if (data?.errors && Array.isArray(data.errors)) {
        const phoneError = data.errors.find((e: any) => e.path?.includes("phone"));
        if (phoneError) {
          errorMessage = "Please enter a valid phone number (e.g., 2135557812).";
        } else {
          errorMessage = data.errors.map((e: any) => e.message).join(", ");
        }
      } else if (typeof errorMessage === "string" && errorMessage.toLowerCase().includes("phone")) {
        errorMessage = "Please enter a valid phone number (e.g., 2135557812).";
      } else if (typeof errorMessage === "string" && errorMessage.toLowerCase().includes("stock")) {
        errorMessage = "The requested quantity exceeds available stock. Please update your cart before proceeding.";
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── OTP helpers ──────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpInputs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    text.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    otpInputs.current[Math.min(text.length, 5)]?.focus();
  };

  // ── Verify OTP ───────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setOtpError("Please enter the full 6-digit code."); return; }
    setOtpError("");
    setOtpLoading(true);
    try {
      await api.post(`/order/${orderId}/verify`, { otp: code });
      
      // Deduct product stock automatically on successful order verification
      for (const item of items) {
        try {
          const prodRes = await api.get(`/product/${item.id}`);
          const currentProduct = prodRes.data?.data;
          if (currentProduct) {
            const currentStock = typeof currentProduct.stock === 'number' ? currentProduct.stock : 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            
            const formData = new FormData();
            formData.append("name", currentProduct.name);
            formData.append("description", currentProduct.description);
            formData.append("price", String(currentProduct.price));
            formData.append("category", currentProduct.category?._id || currentProduct.category);
            formData.append("stock", String(newStock));
            if (currentProduct.discount !== undefined) {
              formData.append("discount", String(currentProduct.discount));
            }
            
            await api.patch(`/product/${item.id}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          }
        } catch (err) {
          console.error("Failed to automatically deduct stock for product ID:", item.id, err);
        }
      }
      
      // Create notification for admin
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName: form.fullName, orderId: orderId.slice(-6).toUpperCase() })
        });
      } catch (err) {
        console.error("Failed to create notification", err);
      }

      setOtpSuccess(true);
      clearCart();
      setTimeout(() => router.push("/success"), 1500);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Invalid or expired code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────
  const handleResend = async () => {
    setResendMsg("");
    setOtpError("");
    setResending(true);
    try {
      await api.post("/order/resend-otp", { email: form.email });
      setResendMsg("A new code has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
      otpInputs.current[0]?.focus();
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  if (items.length === 0 && step === "form" && !isSubmitting) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-[#faf8f5] px-4 text-center">
        <h1 className="font-serif text-3xl text-stone-800 mb-4">Nothing to checkout</h1>
        <Link href="/products" className="btn-gold px-8 py-3.5 rounded-full">
          Back to Shop
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full px-5 py-4 rounded-2xl border border-stone-200 bg-white/50 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4a84b]/50 focus:border-[#d4a84b] transition-all text-sm shadow-inner shadow-stone-50/50";

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] py-28 relative overflow-hidden">
      <div className="absolute top-[5%] right-[-10%] w-[50vw] h-[50vw] bg-[#f5e6c0]/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#e8e0f0]/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-10 relative z-10">
        <AnimatePresence mode="wait">

          {/* ══════════════════════ STEP 1: FORM ══════════════════════ */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <Link
                  href="/cart"
                  className="text-[#d4a84b] hover:text-[#a07828] font-medium text-sm transition-colors flex items-center gap-2"
                >
                  ← Back to Cart
                </Link>
                <h1 className="font-serif text-5xl md:text-6xl text-stone-800 mt-6">
                  Secure <span className="gold-gradient-text">Checkout</span>
                </h1>
              </motion.div>

              <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">

                {/* ─── Form ──────────────────────── */}
                <div className="w-full lg:w-7/12">
                  <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Contact info */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-8 sm:p-10"
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <span className="w-8 h-8 rounded-full bg-[#f5e6c0]/50 flex items-center justify-center text-[#d4a84b] font-medium font-serif">1</span>
                        <h2 className="font-serif text-2xl text-stone-800">Your Details</h2>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="fullName" className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2 ml-1">
                            Full Name <span className="text-rose-400">*</span>
                          </label>
                          <input type="text" id="fullName" required value={form.fullName} onChange={handleChange("fullName")} placeholder="Jane Doe" className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2 ml-1">
                            Email Address <span className="text-rose-400">*</span>
                          </label>
                          <input type="email" id="email" required value={form.email} onChange={handleChange("email")} placeholder="jane@example.com" className={inputClass} />
                          <p className="mt-2 ml-1 text-[10px] text-stone-400 uppercase tracking-wider font-medium">We'll send your order confirmation code here</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label htmlFor="phone" className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2 ml-1">
                              Phone Number <span className="text-rose-400">*</span>
                            </label>
                            <input type="tel" id="phone" required value={form.phone} onChange={handleChange("phone")} placeholder="(555) 123-4567" className={inputClass} />
                          </div>
                          <div>
                            <label htmlFor="instagram" className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2 ml-1">
                              Instagram Handle <span className="text-rose-400">*</span>
                            </label>
                            <input type="text" id="instagram" required value={form.instagram} onChange={handleChange("instagram")} placeholder="@janedoe" className={inputClass} />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Delivery address */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-8 sm:p-10"
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <span className="w-8 h-8 rounded-full bg-[#f5e6c0]/50 flex items-center justify-center text-[#d4a84b] font-medium font-serif">2</span>
                        <h2 className="font-serif text-2xl text-stone-800">Delivery Address</h2>
                      </div>
                      <div>
                        <label htmlFor="address" className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2 ml-1">
                          Full Shipping Address
                        </label>
                        <textarea
                          id="address"
                          required
                          rows={3}
                          value={form.address}
                          onChange={handleChange("address")}
                          placeholder="123 Natural Way, Apt 4B, Irvine, CA 92612"
                          className={inputClass + " resize-none"}
                        />
                      </div>
                    </motion.div>

                    {/* Payment info */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-[#fdfbf7] to-[#f5e6c0]/10 border border-[#d4a84b]/20 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden"
                    >
                      <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-[#d4a84b]/10 rounded-full blur-[30px]" />
                      <div className="flex items-start gap-5 relative z-10">
                        <span className="text-4xl mt-1 drop-shadow-md">💳</span>
                        <div>
                          <h3 className="font-serif text-xl text-stone-800 mb-2">Manual Zelle Payment</h3>
                          <p className="text-stone-500 text-sm leading-relaxed font-light">
                            We will contact you on <strong className="text-rose-500 font-medium">Instagram</strong> to confirm your order and send a Zelle payment request. Your order ships immediately once payment is received.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {error && <p className="text-rose-500 text-sm text-center bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</p>}

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-gold py-5 rounded-full text-lg font-semibold shadow-[0_8px_30px_rgba(212,168,75,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        "Complete Order →"
                      )}
                    </motion.button>
                  </form>
                </div>

                {/* ─── Order Summary ──────────────── */}
                <div className="w-full lg:w-5/12">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-8 sm:p-10 lg:sticky lg:top-32"
                  >
                    <h2 className="font-serif text-2xl text-stone-800 mb-8 pb-4 border-b border-stone-100">Order Summary</h2>
                    <ul className="divide-y divide-stone-50 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-center gap-5 py-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-white to-[#f5f0ea] border border-stone-100 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                            <Image src={item.image} alt={item.name} width={60} height={60} className="object-contain mix-blend-multiply drop-shadow-sm" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-stone-800 text-sm font-medium truncate mb-1">{item.name}</p>
                            <p className="text-stone-400 text-xs font-light">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-stone-800 text-sm font-medium flex-shrink-0">${item.price * item.quantity}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-4 bg-stone-50/50 p-6 rounded-2xl border border-stone-100/50">
                      <div className="flex justify-between text-stone-500 text-sm font-light">
                        <span>Subtotal</span>
                        <span className="font-medium text-stone-700">${total}</span>
                      </div>
                      <div className="flex justify-between text-stone-500 text-sm font-light">
                        <span>Shipping</span>
                        <span className="text-[#a07828] font-medium text-xs bg-[#f5e6c0]/30 px-2 py-1 rounded-md">Pending Confirmation</span>
                      </div>
                      <div className="flex justify-between text-stone-900 text-2xl font-serif pt-4 border-t border-stone-200 mt-2">
                        <span>Total</span>
                        <span>${total}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ══════════════════════ STEP 2: OTP ══════════════════════ */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center min-h-[70vh]"
            >
              <div className="w-full max-w-md mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-20 h-20 bg-[#f5e6c0]/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d4a84b]/20 shadow-[0_8px_30px_rgba(212,168,75,0.15)]"
                  >
                    <Mail size={32} className="text-[#a07828]" strokeWidth={1.5} />
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-serif text-4xl text-stone-800 mb-3"
                  >
                    Confirm Your <span className="gold-gradient-text">Order</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-stone-500 text-sm leading-relaxed font-light"
                  >
                    We&apos;ve sent a 6-digit verification code to<br />
                    <span className="font-semibold text-stone-700">{form.email}</span>
                  </motion.p>
                </div>

                {/* Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-8 sm:p-10"
                >
                  <AnimatePresence mode="wait">
                    {otpSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center py-6 gap-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <p className="font-serif text-xl text-stone-800">Order Confirmed!</p>
                        <p className="text-stone-400 text-sm">Redirecting...</p>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        onSubmit={handleVerifyOtp}
                        className="space-y-7"
                      >
                        {/* OTP inputs */}
                        <div>
                          <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-5 text-center">
                            Enter Verification Code
                          </label>
                          <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                            {otp.map((digit, i) => (
                              <input
                                key={i}
                                ref={(el) => { otpInputs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                className="w-12 h-14 text-center text-xl font-bold text-stone-800 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#d4a84b]/30 focus:border-[#d4a84b] outline-none transition-all"
                              />
                            ))}
                          </div>
                        </div>

                        {otpError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm text-center font-medium bg-red-50 py-3 px-4 rounded-2xl border border-red-100"
                          >
                            {otpError}
                          </motion.p>
                        )}

                        {resendMsg && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-emerald-600 text-sm text-center font-medium bg-emerald-50 py-3 px-4 rounded-2xl border border-emerald-100"
                          >
                            {resendMsg}
                          </motion.p>
                        )}

                        <button
                          type="submit"
                          disabled={otpLoading || otp.join("").length < 6}
                          className="w-full btn-gold py-4 rounded-full font-semibold text-base shadow-[0_8px_30px_rgba(212,168,75,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                        >
                          {otpLoading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify & Confirm Order →"
                          )}
                        </button>

                        <div className="text-center pt-1">
                          <p className="text-stone-400 text-sm mb-3">Didn&apos;t receive the code?</p>
                          <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending}
                            className="inline-flex items-center gap-2 text-[#a07828] font-semibold text-sm hover:text-[#d4a84b] transition-colors disabled:opacity-60"
                          >
                            <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                            {resending ? "Sending..." : "Resend Code"}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

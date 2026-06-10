"use client";

import { useState } from "react";
import { useCart, Product } from "@/context/CartContext";
import { Check, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      id={`add-to-cart-${product.id}`}
      onClick={handleAdd}
      disabled={added}
      className={`w-full py-4 rounded-full text-base font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
        added
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-inner"
          : "btn-gold border border-transparent"
      }`}
    >
      <AnimatePresence mode="wait">
        {added ? (
          <motion.div
            key="added"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Check size={18} strokeWidth={2.5} />
            Added to Cart!
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <ShoppingBag size={18} strokeWidth={2} />
            Add to Collection
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

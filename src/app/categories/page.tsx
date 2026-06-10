"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { Loader2, Tag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryMeta {
  id: string;
  subtitle: string;
  imageUrl: string;
  isLocal: boolean;
}

interface Category {
  _id: string;
  name: string;
  meta?: CategoryMeta;
}

export default function CategoriesPage() {
  // Fetch categories from Railway API
  const { data: rawCategories, isLoading: catLoading } = useQuery({
    queryKey: ["public-categories-list"],
    queryFn: async () => {
      const res = await api.get("/category");
      return res.data.data as any[];
    },
  });

  // Fetch local metadata
  const { data: metaData } = useQuery({
    queryKey: ["public-categories-meta-list"],
    queryFn: async () => {
      const res = await fetch("/api/categories-meta");
      const json = await res.json();
      return (json.categories ?? []) as CategoryMeta[];
    },
  });

  // Merge categories with metadata
  const categories: Category[] = (rawCategories ?? []).map((cat: any) => ({
    _id: cat._id,
    name: cat.name,
    meta: (metaData ?? []).find((m) => m.id === cat._id),
  }));

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] pt-32 pb-24 relative overflow-hidden">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#f5e6c0]/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#e8e0f0]/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <span className="text-xs uppercase tracking-[0.4em] text-[#a07828] mb-6 block font-semibold">
            Ether Catalogue
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-stone-800 mb-8 leading-tight">
            Our <span className="gold-gradient-text">Categories</span>
          </h1>
          <p className="text-stone-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Explore our curated collections, designed to bring nature-inspired luxury and comfort into your home.
          </p>
        </div>

        {/* Categories Grid */}
        {catLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-[#d4a84b]" size={40} />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-40 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag size={32} className="text-stone-200" />
            </div>
            <h3 className="font-serif text-xl text-stone-800 mb-2">No Categories Found</h3>
            <p className="text-stone-400 text-sm">Please check back later or check your admin dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-[2rem] overflow-hidden border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(212,168,75,0.06)] bg-white aspect-[4/5] flex flex-col justify-end transition-all duration-500"
              >
                {/* Background Image Container */}
                <div className="absolute inset-0 bg-stone-50 overflow-hidden">
                  {cat.meta?.imageUrl ? (
                    <img
                      src={cat.meta.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5e6c0]/20 to-stone-50">
                      <Tag size={48} className="text-[#d4a84b]/20" />
                    </div>
                  )}
                  {/* Premium Ambient Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/35 to-transparent transition-opacity duration-500" />
                </div>

                {/* Card Content */}
                <div className="relative z-10 p-8 text-white space-y-3">
                  <h3 className="font-serif text-2xl tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="text-stone-300 text-sm font-light line-clamp-2">
                    {cat.meta?.subtitle || "Explore our handcrafted collection."}
                  </p>
                  
                  <div className="pt-2">
                    <Link
                      href={`/products?category=${cat._id}`}
                      className="inline-flex items-center gap-2 text-[#f5e6c0] text-xs font-semibold uppercase tracking-wider group/link hover:text-white transition-colors duration-300"
                    >
                      Explore Collection
                      <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

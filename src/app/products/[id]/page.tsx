"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';


export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/product/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    retry: false,
  });

  const { data: allProducts } = useQuery({
    queryKey: ['public-products'],
    queryFn: async () => {
      const res = await api.get('/product');
      return res.data.data.products;
    }
  });

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="animate-spin text-[#d4a84b]" size={40} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#faf8f5]">
        <h1 className="text-3xl font-serif text-stone-800 mb-4">Product Not Found</h1>
        <Link href="/products" className="text-[#d4a84b] hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const related = (allProducts || []).filter((p: any) => p._id !== product._id).slice(0, 3);

  // Map backend format to component expected format for AddToCartButton
  const cartProduct = {
    id: product._id,
    name: product.name,
    price: product.price,
    image: product.images?.[0] || "https://placehold.co/600x800/f5e6c0/a07828?text=No+Image",
    description: product.description,
    scent: product.category?.name || "Uncategorized"
  };

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] pt-28 pb-20 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-[10%] left-[-5%] w-[40vw] h-[40vw] bg-[#f5e6c0]/40 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-8 relative z-10">
        <nav className="text-xs tracking-widest uppercase font-medium text-stone-400 flex items-center gap-3">
          <Link href="/" className="hover:text-[#d4a84b] transition-colors">Home</Link>
          <span className="text-stone-300">/</span>
          <Link href="/products" className="hover:text-[#d4a84b] transition-colors">Shop</Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-800">{product.name}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">

          {/* Image Gallery area */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32">
            <div className="rounded-[3rem] aspect-[4/5] relative overflow-hidden bg-gradient-to-b from-white to-[#f5f0ea] border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex items-center justify-center group">
              <img
                src={cartProduct.image}
                alt={product.name}
                className="object-cover w-[85%] h-[85%] mix-blend-multiply drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-transform duration-[1.5s] group-hover:scale-105 rounded-2xl"
              />
              {/* Soft glow behind product */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(212,168,75,0.08) 0%, transparent 60%)" }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 py-4 lg:py-10">
            <span className="text-xs uppercase tracking-[0.4em] text-[#a07828] mb-4 block font-semibold">
              {product.category?.name || "Handmade · Natural"}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-800 mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-stone-500 mb-8 text-lg font-light tracking-wide">{product.stock > 0 ? "In Stock" : "Out of Stock"}</p>
            
            <p className="text-4xl text-stone-900 font-medium mb-10">${product.price.toFixed(2)}</p>

            <div className="w-full h-px bg-gradient-to-r from-stone-200 to-transparent mb-10" />

            <p className="text-stone-600 text-base md:text-lg leading-relaxed mb-12 font-light">
              {product.description}
            </p>

            {/* Attributes */}
            <div className="grid grid-cols-2 gap-4 mb-12">
              {[
                { label: "Ingredients", value: "100% Natural", icon: "🌿" },
                { label: "Crafted in", value: "Irvine, CA", icon: "✨" },
                { label: "Delivery", value: "1–2 Days", icon: "📦" },
                { label: "Payment", value: "Via Zelle", icon: "💳" },
              ].map((attr) => (
                <div key={attr.label} className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-sm flex items-start gap-3">
                  <span className="text-xl mt-0.5 opacity-80">{attr.icon}</span>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">{attr.label}</p>
                    <p className="text-stone-800 font-medium text-sm">{attr.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-100">
              <AddToCartButton product={cartProduct} />
            </div>

            {/* Order note */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-stone-500 bg-[#f5e6c0]/30 py-3 px-4 rounded-xl border border-[#d4a84b]/20">
              <span className="w-2 h-2 rounded-full bg-[#d4a84b] animate-pulse" />
              Payment securely via Zelle after Instagram confirmation.
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-32 pt-20 border-t border-stone-200/60 relative">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-serif text-4xl text-stone-800">You Might Also Love</h2>
              <Link href="/products" className="text-sm font-medium text-[#d4a84b] hover:text-[#a07828] transition-colors hidden sm:block">
                View all products →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {related.map((p: any) => (
                <Link key={p._id} href={`/products/${p._id}`} className="group block">
                  <div className="product-card-hover rounded-[2rem] aspect-[3/4] relative overflow-hidden mb-5 bg-white border border-stone-100">
                    <img
                      src={p.images?.[0] || "https://placehold.co/600x800/f5e6c0/a07828?text=No+Image"}
                      alt={p.name}
                      className="object-cover w-full h-full p-8 mix-blend-multiply transition-transform duration-700 group-hover:scale-110 drop-shadow-sm"
                    />
                  </div>
                  <h3 className="text-lg font-serif text-stone-800 group-hover:text-[#a07828] transition-colors">{p.name}</h3>
                  <p className="text-stone-400 text-sm font-light mt-1">${p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

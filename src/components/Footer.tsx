import Link from "next/link";

export default function Footer() {
  return (
<footer className="bg-black text-stone-400 pt-24 pb-12 overflow-hidden relative">      {/* Decorative gold bloom */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-20 mix-blend-screen"
        style={{ background: "radial-gradient(ellipse at bottom, #fff 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="font-serif text-3xl text-stone-50 block mb-6">
              <span className="text-[#d4a84b]">É T H E R</span> 
            </Link>
            <p className="text-stone-400 max-w-sm text-sm leading-relaxed mb-8">
              Handmade natural soaps and candles crafted in Irvine, California. 
              We believe in the power of slow rituals and pure botanical ingredients.
            </p>
            <a 
              href="https://www.instagram.com/etherbathandbody?igsh=Mm52eWI5anZxMmx5" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#d4a84b] hover:text-[#f5e6c0] transition-colors group"
            >
              Follow us on Instagram
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-stone-50 font-medium tracking-wide mb-6 uppercase text-xs">Shop</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/products" className="hover:text-stone-200 transition-colors">All Products</Link></li>
              <li><Link href="/products" className="hover:text-stone-200 transition-colors">Handmade Soaps</Link></li>
              <li><Link href="/products" className="hover:text-stone-200 transition-colors">Soy Candles</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-stone-50 font-medium tracking-wide mb-6 uppercase text-xs">Information</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/policy" className="hover:text-stone-200 transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/policy" className="hover:text-stone-200 transition-colors">Our Story</Link></li>
              <li><Link href="/policy" className="hover:text-stone-200 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} <span className="gold-gradient-text drop-shadow-sm font-serif">È T H E R</span> All rights reserved.</p>
          <div className="flex gap-6">
            <span>Made with 🤍 in California</span>
            <span>Manual Zelle Payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

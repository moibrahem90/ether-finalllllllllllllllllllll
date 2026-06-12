"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Renders the public storefront Navbar and Footer only on non-admin routes.
 * Admin pages control their own layout entirely — we pass children through
 * without any wrapper to avoid interfering with the admin flex layout.
 */
export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Admin has its own layout — render children directly, but keep the public navbar on desktop if requested
  if (isAdminRoute) {
    return (
      <>
        <div className="hidden md:block">
          <Navbar />
        </div>
        {children}
      </>
    );
  }

  // Public pages get the storefront shell
  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ConditionalShell from "@/components/ConditionalShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "È T H E R",
  description: "Handmade natural products with relaxing scents.",
  icons: {
    icon: "/photos/logo-n.jpg"
  }
};

import QueryProvider from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-stone-50 text-stone-900 flex flex-col min-h-screen`}
      >
        <QueryProvider>
          <CartProvider>
            <ConditionalShell>{children}</ConditionalShell>
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

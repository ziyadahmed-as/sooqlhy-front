import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthModal from "@/components/auth/AuthModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Sooqly — Premium Multi-Vendor Marketplace", template: "%s | Sooqly" },
  description: "Discover millions of products from verified vendors. Secure payments, fast delivery, buyer protection.",
  keywords: ["ecommerce", "marketplace", "shopping", "vendors", "deals"],
  openGraph: {
    title: "Sooqly — Premium Multi-Vendor Marketplace",
    description: "Discover millions of products from verified vendors.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-surface text-navy antialiased" suppressHydrationWarning>
        {children}
        <AuthModal />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

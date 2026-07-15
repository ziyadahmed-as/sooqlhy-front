"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Heart, User, Bell, Menu, X, ChevronRight,
  ArrowRight, Shield, Truck, RotateCcw, Headphones, Star, Flame,
  Zap, TrendingUp, Package, ChevronLeft, ChevronDown, LogOut
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useUIStore } from "@/stores/ui-store";
import { fetchCategories, fetchCatalog } from "@/lib/api/catalog";
import { fetchFlashSales } from "@/lib/api/promotions";
import { searchProducts } from "@/lib/api/search";
import type { Category, Product, FlashSale } from "@/lib/types";
import SectionWrapper from "@/components/sections/SectionWrapper";
import { toast } from "sonner";

// ─── Announcement Bar ────────────────────────────────────────────────────────
function AnnouncementBar({ flashSale }: { flashSale: FlashSale | null }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-navy text-white text-xs font-medium py-2 px-4 flex items-center justify-center gap-3 relative">
      <Flame className="w-3.5 h-3.5 text-gold flex-shrink-0" />
      <span>
        {flashSale
          ? `🔥 ${flashSale.name} — ${flashSale.discount_percentage}% OFF! Ends soon.`
          : "Free shipping on orders over $25 · New vendors joining daily · Shop with confidence"}
      </span>
      <Link href="/buyer/catalog" className="underline font-semibold hover:text-gold transition-colors ml-1">
        Shop Now
      </Link>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 text-white/60 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

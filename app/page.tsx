"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Heart, User, Bell, Menu, X, ChevronRight,
  ArrowRight, Shield, Truck, RotateCcw, Headphones, Star, Flame,
  Tag, Gift, CheckCircle, ShieldCheck, Sparkles, ChevronLeft, LogOut,
  Package, Zap, TrendingUp
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useUIStore } from "@/stores/ui-store";
import { fetchCategories, fetchCatalog } from "@/lib/api/catalog";
import { fetchFlashSales } from "@/lib/api/promotions";
import type { Category, Product, FlashSale } from "@/lib/types";
import SectionWrapper from "@/components/sections/SectionWrapper";
import { toast } from "sonner";

// ─── Hero slides (static promotional copy — replaced by flash sale data) ─────
const HERO_SLIDES = [
  {
    title: "Super Tech Deals",
    subtitle: "Smartphones, wearables & audio gadgets — up to 50% off",
    cta: "Shop Electronics",
    href: "/buyer/catalog?category=electronics",
    gradient: "from-slate-900 via-blue-950 to-indigo-950",
    badge: "Hot Deal",
  },
  {
    title: "Fashion Carnival",
    subtitle: "Streetwear, activewear & seasonal styles — up to 70% off",
    cta: "Shop Fashion",
    href: "/buyer/catalog?category=fashion",
    gradient: "from-rose-950 via-pink-950 to-orange-950",
    badge: "Trending",
  },
  {
    title: "Smart Home Sale",
    subtitle: "Lighting, security & intelligent living systems",
    cta: "Shop Home",
    href: "/buyer/catalog?category=home",
    gradient: "from-violet-950 via-purple-950 to-blue-950",
    badge: "New Arrivals",
  },
];

// ─── Trust features ────────────────────────────────────────────────────────
const TRUST_FEATURES = [
  { icon: ShieldCheck, title: "Secure Payments", desc: "Escrow protection on every order" },
  { icon: Truck, title: "Fast Delivery", desc: "Verified drivers assigned per order" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day hassle-free return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Live chat & phone support" },
];

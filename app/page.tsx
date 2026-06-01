"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle,
  Store,
  Star,
  Flame,
  Gift,
  Globe,
  Percent,
  Heart,
  TrendingUp,
  Tag,
  Zap,
  ShieldCheck,
  RotateCcw,
  Truck
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { fetchCatalog, fetchCategories, addToCart } from "@/lib/api/catalog";
import { Product, Category } from "@/lib/types";
import { toast } from "sonner";

// Custom Mock Product Type for Fallback visual rich cards
interface MockProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  soldPercent?: number;
  isFreeShipping?: boolean;
  isChoice?: boolean;
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Navigation states
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [claimedCoupon, setClaimedCoupon] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);

  // API states
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Flash sale countdown timer state (2h 14m 50s)
  const [timeLeft, setTimeLeft] = useState(8090); // in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 8090));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hrs.toString().padStart(2, "0"),
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0")
    };
  };

  const timeFormatted = formatTime(timeLeft);

  // Load backend categories and products
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cats, prodData] = await Promise.all([
          fetchCategories().catch(() => []),
          fetchCatalog({ page: 1 }).catch(() => ({ results: [], count: 0 }))
        ]);
        setDbCategories(cats);
        setDbProducts(prodData.results || []);
      } catch (err) {
        console.error("Error loading backend e-commerce data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Check cart items
    const savedCart = localStorage.getItem("sooqly_cart_count");
    if (savedCart) {
      setCartCount(Number(savedCart));
    }
  }, []);

  // Carousel auto rotate
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buyer/catalog?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/buyer/catalog`);
    }
  };

  const handleQuickSearch = (tag: string) => {
    setSearchQuery(tag);
    router.push(`/buyer/catalog?search=${encodeURIComponent(tag)}`);
  };

  const handleClaimCoupon = () => {
    setClaimedCoupon(true);
    toast.success("Coupon claimed successfully! $4.00 voucher added to your account.", {
      icon: <Gift className="text-red-500 w-5 h-5" />,
      duration: 4000
    });
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!user) {
        toast.error("Please log in to add items to your cart.");
        router.push("/auth/login");
        return;
      }
      await addToCart({ product_id: productId, quantity: 1 });
      const newCount = cartCount + 1;
      setCartCount(newCount);
      localStorage.setItem("sooqly_cart_count", String(newCount));
      toast.success("Item added to cart successfully!", {
        icon: <ShoppingCart className="text-green-500 w-5 h-5" />
      });
    } catch (err) {
      // Offline fallback increment
      const newCount = cartCount + 1;
      setCartCount(newCount);
      localStorage.setItem("sooqly_cart_count", String(newCount));
      toast.success("Item added to cart (Local Mode)", {
        description: "Your selection was saved locally."
      });
    }
  };

  // Mock Banners
  const slides = [
    {
      title: "Super Tech Deals",
      subtitle: "Smartphones, wearables & audio gadgets up to 50% off",
      image: "/tech_banner.png",
      link: "/buyer/catalog",
      bgClass: "from-red-950 via-slate-900 to-orange-950 text-white"
    },
    {
      title: "Summer Fashion carnival",
      subtitle: "Sizzling styles, streetwear & active clothing up to 70% off",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470&auto=format&fit=crop",
      link: "/buyer/catalog",
      bgClass: "from-pink-900 via-rose-950 to-orange-900 text-white"
    },
    {
      title: "Smart Home Extravaganza",
      subtitle: "Elevate your living spaces with intelligent systems & lights",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1470&auto=format&fit=crop",
      link: "/buyer/catalog",
      bgClass: "from-blue-950 via-indigo-950 to-purple-950 text-white"
    }
  ];

  // Category items (Sidebar)
  const categoriesList = [
    { id: "electronics", label: "Consumer Electronics", sub: ["Smartphones", "Laptops", "Smartwatches", "Airbuds", "Gaming Consoles"] },
    { id: "fashion", label: "Men & Women Fashion", sub: ["Dresses", "Jackets", "Hoodies", "Sneakers", "Jewelry", "Watches"] },
    { id: "home", label: "Home, Garden & Kitchen", sub: ["Spoons & Cutlery", "LED Lights", "Decorations", "Plates", "Beddings"] },
    { id: "beauty", label: "Beauty & Health", sub: ["Makeup Tools", "Skincare", "Massage Guns", "Hair Styling", "Perfumes"] },
    { id: "sports", label: "Sports & Outdoors", sub: ["Camping Gear", "Bicycles", "Yoga Mats", "Dumbbells", "Running Shoes"] },
    { id: "toys", label: "Toys, Hobbies & Babies", sub: ["Action Figures", "Puzzles", "Baby Care", "RC Drones", "Board Games"] },
    { id: "phones", label: "Phones & Accessories", sub: ["Phone Cases", "Cables", "Power Banks", "Screen Protectors", "Tripods"] },
    { id: "tools", label: "Tools & Home Utilities", sub: ["Screwdrivers", "Drills", "Organizers", "Measuring Tapes", "Smart Locks"] }
  ];

  // Super Deals Mock Products
  const superDealsProducts: MockProduct[] = [
    {
      id: "sd1",
      name: "TWS Wireless Earbuds Pro Active Noise Cancelling",
      price: 12.99,
      originalPrice: 49.99,
      discount: 74,
      rating: 4.8,
      reviews: 1420,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop",
      soldPercent: 84,
      isChoice: true
    },
    {
      id: "sd2",
      name: "4K Action Camera Waterproof Sports Cam with Mount Kit",
      price: 24.50,
      originalPrice: 79.99,
      discount: 69,
      rating: 4.6,
      reviews: 310,
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600&auto=format&fit=crop",
      soldPercent: 62,
      isFreeShipping: true
    },
    {
      id: "sd3",
      name: "RGB Mechanical Keyboard Compact Gaming Layout",
      price: 18.99,
      originalPrice: 59.99,
      discount: 68,
      rating: 4.9,
      reviews: 865,
      image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop",
      soldPercent: 95,
      isChoice: true
    },
    {
      id: "sd4",
      name: "Smart Fitness Watch Tracker with Heart Rate Monitor",
      price: 15.20,
      originalPrice: 39.99,
      discount: 62,
      rating: 4.5,
      reviews: 2150,
      image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop",
      soldPercent: 47,
      isFreeShipping: true
    }
  ];

  // Welcome Deals Mock Products
  const welcomeDealsProducts: MockProduct[] = [
    {
      id: "wd1",
      name: "Fast USB-C Charging Cable braided cord (1m)",
      price: 0.01,
      originalPrice: 4.99,
      discount: 99,
      rating: 4.9,
      reviews: 12450,
      image: "https://images.unsplash.com/photo-1541667590-f7694f24ecab?q=80&w=600&auto=format&fit=crop",
      isChoice: true
    },
    {
      id: "wd2",
      name: "Ergonomic Silent USB Wireless Mouse 1600 DPI",
      price: 0.99,
      originalPrice: 12.99,
      discount: 92,
      rating: 4.7,
      reviews: 4320,
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop",
      isChoice: true
    },
    {
      id: "wd3",
      name: "Portable LED USB Light flexible neck lamp",
      price: 0.49,
      originalPrice: 6.99,
      discount: 93,
      rating: 4.8,
      reviews: 840,
      image: "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?q=80&w=600&auto=format&fit=crop",
      isChoice: true
    },
    {
      id: "wd4",
      name: "Universal Desktop Cellphone Holder Stand Foldable",
      price: 0.19,
      originalPrice: 8.99,
      discount: 97,
      rating: 4.6,
      reviews: 6410,
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=600&auto=format&fit=crop",
      isChoice: true
    }
  ];

  // More to Love Mock Products (Fallback feed when DB is empty)
  const fallbackFeed: MockProduct[] = [
    {
      id: "ml1",
      name: "Ultra Bass Bluetooth Headphones Over-Ear Earcups",
      price: 34.99,
      originalPrice: 89.99,
      discount: 61,
      rating: 4.8,
      reviews: 340,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
      isFreeShipping: true,
      isChoice: true
    },
    {
      id: "ml2",
      name: "Ultrasonic Humidifier & Essential Oil Diffuser RGB",
      price: 19.99,
      originalPrice: 42.00,
      discount: 52,
      rating: 4.7,
      reviews: 188,
      image: "https://images.unsplash.com/photo-1519183071298-a2962feb14f4?q=80&w=600&auto=format&fit=crop",
      isFreeShipping: true
    },
    {
      id: "ml3",
      name: "Rechargeable Facial Cleansing Brush Waterproof",
      price: 11.45,
      originalPrice: 29.99,
      discount: 61,
      rating: 4.5,
      reviews: 95,
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
      isChoice: true
    },
    {
      id: "ml4",
      name: "Unisex Retro Streetwear Sneakers Lightweight Comfort",
      price: 27.80,
      originalPrice: 65.00,
      discount: 57,
      rating: 4.9,
      reviews: 512,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
      isFreeShipping: true,
      isChoice: true
    },
    {
      id: "ml5",
      name: "HD WiFi Mini Smart Projector Home Cinema",
      price: 49.99,
      originalPrice: 120.00,
      discount: 58,
      rating: 4.6,
      reviews: 84,
      image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=600&auto=format&fit=crop",
      isFreeShipping: true
    },
    {
      id: "ml6",
      name: "Premium Chef Knife High Carbon Stainless Steel 8-inch",
      price: 22.90,
      originalPrice: 45.00,
      discount: 49,
      rating: 4.8,
      reviews: 1040,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop",
      isChoice: true
    },
    {
      id: "ml7",
      name: "Smart Drink Self-Heating Mug with Coaster Set",
      price: 15.99,
      originalPrice: 35.00,
      discount: 54,
      rating: 4.7,
      reviews: 215,
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
      isChoice: true
    },
    {
      id: "ml8",
      name: "Universal Camera Lens Kit for Smartphones 10-in-1",
      price: 8.99,
      originalPrice: 24.99,
      discount: 64,
      rating: 4.4,
      reviews: 730,
      image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=600&auto=format&fit=crop",
      isFreeShipping: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-zinc-950 font-sans pb-12">
      {/* 🚀 TOP RED BANNER */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-2.5 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-inner">
        <Sparkles className="w-4 h-4 animate-bounce" />
        <span>Sooqly Global Shopping Day! Free shipping on Choice items over $15 & Extra 10% cash back!</span>
        <Link href="/buyer/catalog" className="underline hover:text-yellow-100 flex items-center ml-2">
          Shop Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {/* 🔍 SEARCH HEADER SECTION */}
      <header className="bg-white sticky top-0 z-40 border-b border-zinc-200 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="bg-[#FF4747] text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform duration-300">
                <Flame className="w-6 h-6 fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#FF4747] via-[#FF6A00] to-[#E62E04] bg-clip-text text-transparent">
                Sooqly
              </span>
              <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest border border-red-200 ml-1">
                Plus
              </span>
            </Link>
          </div>

          {/* E-Commerce AliExpress Search Bar */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Find smart watches, earbuds, dresses, home accessories..."
                className="w-full pl-4 pr-32 py-2.5 border-2 border-[#FF4747] rounded-full focus:outline-none focus:ring-4 focus:ring-red-100 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-6 bg-[#FF4747] text-white rounded-full hover:bg-red-600 active:scale-95 transition-all flex items-center gap-1 text-sm font-semibold shadow-md shadow-red-500/10 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
            {/* Quick Keywords tags */}
            <div className="hidden md:flex items-center gap-3.5 mt-2 pl-3 text-xs text-zinc-500 overflow-hidden">
              <span className="font-semibold text-zinc-600">Trending:</span>
              {["earbuds", "men sneakers", "smart watches", "hair dryer", "drones", "makeup brush"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickSearch(tag)}
                  className="hover:text-[#FF4747] hover:underline cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Utilities (Wishlist, Cart, Account) */}
          <div className="flex items-center gap-5 justify-end">
            {/* Country Selector */}
            <div className="hidden lg:flex items-center gap-1.5 cursor-pointer text-xs font-medium text-zinc-600 hover:text-[#FF4747] transition-colors">
              <Globe className="w-4 h-4" />
              <span>US / USD</span>
            </div>

            {/* Wishlist */}
            <Link href="/buyer/orders" className="relative group flex flex-col items-center text-zinc-600 hover:text-[#FF4747] transition-colors">
              <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] mt-0.5 hidden sm:block">Wishlist</span>
            </Link>

            {/* Cart Count Icon */}
            <Link href="/catalog" className="relative group flex flex-col items-center text-[#FF4747] hover:text-red-600 transition-colors">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 hidden sm:block font-medium">Cart</span>
            </Link>

            {/* User Dropdown Profile card */}
            <div className="relative group flex items-center gap-2 pl-3 border-l border-zinc-200">
              <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[#FF4747] shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left text-xs hidden sm:block">
                <p className="text-zinc-400 font-light leading-none">Welcome</p>
                <p className="font-bold text-zinc-800 leading-tight mt-0.5 truncate max-w-[100px]">
                  {user ? (user.name || user.email) : "Sign In"}
                </p>
              </div>

              {/* Hover Dropdown card */}
              <div className="absolute right-0 top-full mt-2 bg-white text-zinc-800 shadow-2xl rounded-2xl p-4 w-60 border border-zinc-100 hidden group-hover:block z-50">
                {user ? (
                  <div>
                    <p className="font-bold text-sm text-zinc-900">Hello, {user.name || "Customer"}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{user.email}</p>
                    <div className="mt-3.5 bg-red-50 rounded-lg p-2.5 border border-red-100 flex items-center gap-2">
                      <Percent className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-[10px] text-red-600 font-semibold">Verified Member Discount Eligible</span>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <Link href="/buyer/orders" className="w-full block text-center py-2 bg-[#FF4747] text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors">
                        My Dashboard
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-sm">Welcome to Sooqly!</p>
                    <p className="text-xs text-zinc-400 mt-1">Discover millions of multi-vendor deals.</p>
                    <div className="mt-4 flex gap-2.5">
                      <Link href="/auth/login" className="flex-1 text-center py-2 border border-[#FF4747] text-[#FF4747] hover:bg-red-50 transition-colors rounded-xl text-xs font-bold">
                        Sign In
                      </Link>
                      <Link href="/register" className="flex-1 text-center py-2 bg-[#FF4747] text-white hover:bg-red-600 transition-colors rounded-xl text-xs font-bold shadow-md shadow-red-500/10">
                        Join Free
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION LAYOUT (CATEGORIES SIDEBAR + DYNAMIC CAROUSEL + WELCOME VOUCHER BOX) */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left: Category Sidebar */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-150 p-4 relative hidden lg:block">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-800 mb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#FF4747]" />
              <span>Categories</span>
            </h3>
            <ul className="space-y-0.5">
              {categoriesList.map((cat) => (
                <li
                  key={cat.id}
                  onMouseEnter={() => setHoverCategory(cat.id)}
                  onMouseLeave={() => setHoverCategory(null)}
                  className="relative"
                >
                  <button className="w-full text-left py-2 px-3 rounded-lg text-xs font-medium text-zinc-700 hover:text-[#FF4747] hover:bg-red-50/50 flex items-center justify-between transition-all cursor-pointer">
                    <span>{cat.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Mega Menu popup overlay */}
                  <AnimatePresence>
                    {hoverCategory === cat.id && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute left-full top-0 ml-1 bg-white border border-zinc-150 shadow-2xl rounded-2xl p-5 w-72 z-50 grid grid-cols-1 gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2 mb-3">
                            Popular in {cat.label}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {cat.sub.map((subItem) => (
                              <Link
                                key={subItem}
                                href={`/buyer/catalog?search=${encodeURIComponent(subItem)}`}
                                className="text-xs text-zinc-600 hover:text-[#FF4747] hover:underline"
                              >
                                {subItem}
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                          <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest">Limited promotion</p>
                          <p className="text-xs text-zinc-700 font-semibold mt-1">Get up to 60% OFF select {cat.label} items</p>
                          <Link href="/buyer/catalog" className="inline-block mt-2.5 text-[10px] text-white font-bold bg-[#FF4747] px-3.5 py-1 rounded-full hover:bg-red-600">
                            Explore Catalog
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
          </div>

          {/* Center: Image Carousel */}
          <div className="lg:col-span-2 relative bg-zinc-900 rounded-2xl overflow-hidden shadow-sm h-[380px] group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full"
              >
                {slides[currentSlide].image.startsWith("http") ? (
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div className="absolute inset-0">
                    <Image
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      fill
                      className="object-cover opacity-70"
                      priority
                    />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                {/* Banner Content */}
                <div className="absolute bottom-10 left-8 right-8 text-white z-10">
                  <span className="text-[10px] bg-[#FF4747] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-widest mb-3 inline-block animate-pulse">
                    Hot Deal
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-sm text-zinc-300 font-medium mt-1.5 max-w-md">
                    {slides[currentSlide].subtitle}
                  </p>
                  <Link
                    href={slides[currentSlide].link}
                    className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 bg-gradient-to-r from-[#FF4747] to-[#FF8C00] text-white hover:scale-105 active:scale-95 transition-all rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    <span>Shop Clearance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-15 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-15 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Indicators dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-15">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? "bg-white scale-125 px-2" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right: User Welcome / Newcomer Box */}
          <div className="flex flex-col gap-4">
            
            {/* Welcome widget card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-150 text-center flex-1 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF4747] to-[#FF8C00] flex items-center justify-center text-white mx-auto shadow-lg shadow-red-500/10">
                  <User className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-sm text-zinc-900 mt-3 leading-tight">
                  {user ? `Hello, ${user.name || "Customer"}` : "Welcome to Sooqly"}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-[180px] mx-auto">
                  Register today and explore top multi-vendor products!
                </p>
              </div>

              {!user && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Link href="/auth/login" className="py-2 text-center rounded-xl bg-red-50 border border-red-200 text-[#FF4747] text-xs font-bold hover:bg-red-100 transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="py-2 text-center rounded-xl bg-[#FF4747] text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-md shadow-red-500/5">
                    Register
                  </Link>
                </div>
              )}

              <div className="mt-4 flex items-center justify-around bg-zinc-50 rounded-xl p-2.5 border border-zinc-100">
                <div className="text-center">
                  <p className="text-xs font-extrabold text-[#FF4747]">10k+</p>
                  <p className="text-[9px] font-medium text-zinc-500 uppercase">Brands</p>
                </div>
                <div className="h-5 w-[1px] bg-zinc-200" />
                <div className="text-center">
                  <p className="text-xs font-extrabold text-[#FF4747]">24/7</p>
                  <p className="text-[9px] font-medium text-zinc-500 uppercase">Support</p>
                </div>
                <div className="h-5 w-[1px] bg-zinc-200" />
                <div className="text-center">
                  <p className="text-xs font-extrabold text-[#FF4747]">100%</p>
                  <p className="text-[9px] font-medium text-zinc-500 uppercase">Secure</p>
                </div>
              </div>
            </div>

            {/* Newcomer Coupon box */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4 shadow-sm border border-red-100 flex flex-col justify-between">
              <div className="flex items-start gap-2.5">
                <div className="bg-[#FF4747] text-white p-2 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-black text-xs text-red-600 uppercase tracking-wider">Newcomer Exclusive</h5>
                  <p className="text-lg font-black text-zinc-900 leading-tight mt-0.5">
                    $4.00 Voucher
                  </p>
                  <p className="text-[10px] text-zinc-500 font-medium">Valid on first purchase. Min spend $10.</p>
                </div>
              </div>

              <div className="mt-4">
                {claimedCoupon ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-zinc-200 text-zinc-500 text-xs font-bold flex items-center justify-center gap-1.5 border border-zinc-300"
                  >
                    <CheckCircle className="w-4 h-4 text-zinc-400" />
                    <span>Coupon Claimed!</span>
                  </button>
                ) : (
                  <button
                    onClick={handleClaimCoupon}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF4747] to-[#FF8C00] text-white text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 shadow-md shadow-red-500/10"
                  >
                    <span>Claim Coupon</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ⏳ SUPER DEALS SECTION (FLASH SALE COOLDOWN TIMER) */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-150">
          
          {/* Header block with countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-xl text-[#FF4747] flex items-center justify-center">
                <Flame className="w-6 h-6 fill-red-500 text-red-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900">Super Deals</h3>
                <p className="text-xs text-zinc-500">Top-selling products at rock-bottom prices</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-600 flex items-center gap-1">
                <Clock className="w-4 h-4 text-red-500" />
                Ends in:
              </span>
              <div className="flex items-center gap-1 font-mono font-bold text-xs text-white">
                <span className="bg-zinc-900 px-2 py-1.5 rounded-lg min-w-[28px] text-center">{timeFormatted.hours}</span>
                <span className="text-zinc-900 font-extrabold">:</span>
                <span className="bg-zinc-900 px-2 py-1.5 rounded-lg min-w-[28px] text-center">{timeFormatted.minutes}</span>
                <span className="text-zinc-900 font-extrabold">:</span>
                <span className="bg-[#FF4747] px-2 py-1.5 rounded-lg min-w-[28px] text-center">{timeFormatted.seconds}</span>
              </div>
            </div>
          </div>

          {/* Flash Deals product cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {superDealsProducts.map((prod) => (
              <Link
                key={prod.id}
                href="/buyer/catalog"
                className="group border border-zinc-100 rounded-2xl p-3 flex flex-col hover:shadow-lg hover:border-zinc-200 transition-all bg-zinc-50/50"
              >
                <div className="relative rounded-xl overflow-hidden aspect-square bg-white flex-shrink-0">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#FF4747] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    -{prod.discount}%
                  </div>
                  {prod.isChoice && (
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Choice
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between mt-3">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 leading-tight group-hover:text-[#FF4747] transition-colors">
                      {prod.name}
                    </h4>
                    {/* Star Rating details */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-[10px] font-extrabold text-zinc-700">{prod.rating}</span>
                      <span className="text-[9px] text-zinc-400">({prod.reviews})</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    {/* Price labels */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-[#FF4747]">${prod.price.toFixed(2)}</span>
                      <span className="text-[10px] text-zinc-400 line-through">${prod.originalPrice.toFixed(2)}</span>
                    </div>

                    {/* Stock items progress bar */}
                    {prod.soldPercent && (
                      <div className="mt-2.5">
                        <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#FF4747] to-orange-400 h-full rounded-full"
                            style={{ width: `${prod.soldPercent}%` }}
                          />
                        </div>
                        <p className="text-[9px] font-semibold text-zinc-500 mt-1 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-[#FF4747] fill-current" />
                          <span>{prod.soldPercent}% sold</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 🎁 NEWCOMER WELCOME INCENTIVES (UNDER $0.99 ZONE) */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-gradient-to-r from-[#FF4747] to-orange-500 rounded-2xl p-5 shadow-sm text-white">
          <div className="flex items-center gap-2 border-b border-white/20 pb-4 mb-5">
            <div className="bg-white/20 p-2 rounded-xl flex items-center justify-center text-white">
              <Gift className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Newcomer Welcome Deals</h3>
              <p className="text-xs text-red-100">Claim prices under $1.00 on your first e-commerce order!</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {welcomeDealsProducts.map((prod) => (
              <Link
                key={prod.id}
                href="/buyer/catalog"
                className="group bg-white text-zinc-800 rounded-2xl p-3 flex flex-col hover:shadow-xl hover:scale-[1.01] transition-all"
              >
                <div className="relative rounded-xl overflow-hidden aspect-square bg-zinc-50 flex-shrink-0">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#FF4747] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Welcome Deal
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between mt-3">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 leading-tight group-hover:text-[#FF4747] transition-colors">
                      {prod.name}
                    </h4>
                  </div>
                  <div className="mt-3.5 border-t border-zinc-100 pt-2.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-[#FF4747]">${prod.price.toFixed(2)}</span>
                      <span className="text-[10px] text-zinc-400 line-through">${prod.originalPrice.toFixed(2)}</span>
                    </div>
                    <span className="text-[9px] bg-red-50 text-[#FF4747] px-2 py-0.5 rounded-full font-bold inline-block mt-1">
                      99% Off
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🏪 TOP BRANDS / WEEKLY SELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <h3 className="text-base font-extrabold text-zinc-950 mb-4 flex items-center gap-2">
          <Store className="w-5 h-5 text-[#FF4747]" />
          <span>Top Vendor Brands</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Baseus Smart Office Store",
              followers: "128k",
              rating: "4.9",
              badge: "Premium Vendor",
              logo: "B",
              bg: "from-blue-600 to-slate-900",
              items: [
                "https://images.unsplash.com/photo-1541667590-f7694f24ecab?q=80&w=200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?q=80&w=200&auto=format&fit=crop"
              ]
            },
            {
              name: "Anker Audio Official",
              followers: "542k",
              rating: "4.8",
              badge: "Top Brand",
              logo: "A",
              bg: "from-[#FF4747] to-red-950",
              items: [
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=200&auto=format&fit=crop"
              ]
            },
            {
              name: "Fashion Hub Official",
              followers: "84k",
              rating: "4.9",
              badge: "Verified Vendor",
              logo: "F",
              bg: "from-purple-600 to-indigo-950",
              items: [
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200&auto=format&fit=crop"
              ]
            }
          ].map((vendor, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-150 flex flex-col justify-between">
              
              {/* Header profile of store */}
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${vendor.bg} flex items-center justify-center font-bold text-white shadow-md`}>
                  {vendor.logo}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-900 truncate max-w-[160px] leading-tight">
                    {vendor.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-red-50 text-[#FF4747] font-bold px-1.5 py-0.2 rounded-md">
                      {vendor.badge}
                    </span>
                    <span className="text-[9px] text-zinc-400">{vendor.followers} Followers</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="flex items-center text-yellow-400 gap-0.5 justify-end">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold text-zinc-800">{vendor.rating}</span>
                  </div>
                  <span className="text-[8px] font-semibold text-green-600 block uppercase">KYC Verified</span>
                </div>
              </div>

              {/* Product sample icons */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {vendor.items.map((itemImg, itemIdx) => (
                  <div key={itemIdx} className="rounded-xl overflow-hidden aspect-square border border-zinc-100 bg-zinc-50 relative group">
                    <img
                      src={itemImg}
                      alt="Sample item"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>

              <Link href="/buyer/catalog" className="w-full block text-center py-2 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-100 hover:text-zinc-900 transition-all mt-4">
                Visit Store
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 "MORE TO LOVE" FEED GRID (LOADS FROM DB CATALOG OR FALLS BACK TO DETAILED TILES) */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-3">
          <h3 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF4747]" />
            <span>More to Love</span>
          </h3>
          <Link href="/buyer/catalog" className="text-xs font-bold text-[#FF4747] hover:underline flex items-center gap-0.5">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#FF4747] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500 font-medium mt-3">Loading custom feed...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1. Show DB products first if available */}
            {dbProducts.map((prod) => {
              const title = prod.title || prod.name || "Unnamed Product";
              const imgUrl = (Array.isArray(prod.images) && prod.images.length > 0)
                ? (typeof prod.images[0] === "string" ? prod.images[0] : prod.images[0]?.image)
                : "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=600&auto=format&fit=crop";
              const rating = prod.avg_rating || prod.average_rating || 4.7;
              const price = prod.price ?? 0;
              const originalPrice = price * 1.5;

              return (
                <Link
                  key={prod.id}
                  href={`/buyer/catalog/${prod.id}`}
                  className="group bg-white border border-zinc-150 rounded-2xl p-3 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="relative rounded-xl overflow-hidden aspect-square bg-zinc-50 flex-shrink-0">
                    <img
                      src={imgUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#FF4747] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Choice
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between mt-3">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 leading-tight group-hover:text-[#FF4747] transition-colors">
                        {title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="text-[10px] font-extrabold text-zinc-700">{rating.toFixed(1)}</span>
                        <span className="text-[9px] text-zinc-400">({Math.floor(rating * 15)})</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#FF4747]">${price.toFixed(2)}</span>
                        <span className="text-[10px] text-zinc-400 line-through">${originalPrice.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="text-[8px] bg-green-50 text-green-600 font-extrabold px-1.5 py-0.5 rounded border border-green-200">
                          Free Shipping
                        </span>
                        
                        <button
                          onClick={(e) => handleAddToCart(prod.id, e)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-[#FF4747] text-[#FF4747] hover:text-white transition-colors cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* 2. Fallback visual mockup cards */}
            {fallbackFeed.map((prod) => (
              <Link
                key={prod.id}
                href="/buyer/catalog"
                className="group bg-white border border-zinc-150 rounded-2xl p-3 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all animate-fade-in"
              >
                <div className="relative rounded-xl overflow-hidden aspect-square bg-zinc-50 flex-shrink-0">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#FF4747] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    -{prod.discount}%
                  </div>
                  {prod.isChoice && (
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Choice
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between mt-3">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 leading-tight group-hover:text-[#FF4747] transition-colors">
                      {prod.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-[10px] font-extrabold text-zinc-700">{prod.rating}</span>
                      <span className="text-[9px] text-zinc-400">({prod.reviews})</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-[#FF4747]">${prod.price.toFixed(2)}</span>
                      <span className="text-[10px] text-zinc-400 line-through">${prod.originalPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${
                        prod.isFreeShipping
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-red-50 text-[#FF4747] border-red-200"
                      }`}>
                        {prod.isFreeShipping ? "Free Shipping" : "Choice Item"}
                      </span>
                      
                      <button
                        onClick={(e) => handleAddToCart(prod.id, e)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-[#FF4747] text-[#FF4747] hover:text-white transition-colors cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          </div>
        )}
      </section>

      {/* 🛡️ SECURITY & TRUST BANNER */}
      <section className="max-w-7xl mx-auto px-4 mt-12 bg-white rounded-2xl p-6 shadow-sm border border-zinc-150 grid grid-cols-1 sm:grid-cols-4 gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-red-50 text-[#FF4747] p-3 rounded-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-800">Secure Payments</h4>
            <p className="text-[11px] text-zinc-500 font-medium mt-1">Escrow holding secures cash payouts upon delivery proof.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-red-50 text-[#FF4747] p-3 rounded-2xl">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-800">Assigned Logistics</h4>
            <p className="text-[11px] text-zinc-500 font-medium mt-1">Order tracking and verified logistics drivers assignment.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-red-50 text-[#FF4747] p-3 rounded-2xl">
            <RotateCcw className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-800">Buyer Protection</h4>
            <p className="text-[11px] text-zinc-500 font-medium mt-1">7-day cash back guarantee and dispute resolution support.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-red-50 text-[#FF4747] p-3 rounded-2xl">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-800">KYC Moderation</h4>
            <p className="text-[11px] text-zinc-500 font-medium mt-1">All vendor shops are fully certified and verified.</p>
          </div>
        </div>
      </section>

      {/* 🌎 DETAILED E-COMMERCE FOOTER */}
      <footer className="mt-16 bg-zinc-900 text-zinc-400 py-12 border-t-4 border-[#FF4747] text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <h5 className="font-extrabold text-white uppercase mb-4 tracking-wider">Customer Services</h5>
            <ul className="space-y-2.5 font-medium">
              <li><Link href="#" className="hover:text-white hover:underline">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Transaction Disputes</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Submit a Report</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Buyer Guide</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-extrabold text-white uppercase mb-4 tracking-wider">Vendor Resources</h5>
            <ul className="space-y-2.5 font-medium">
              <li><Link href="#" className="hover:text-white hover:underline">Seller Login</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">KYC Requirements</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Platform Commissions</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Payout Setup</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-extrabold text-white uppercase mb-4 tracking-wider">Logistics & Delivery</h5>
            <ul className="space-y-2.5 font-medium">
              <li><Link href="#" className="hover:text-white hover:underline">Shipping Info</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Become a Driver</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Delivery Standards</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Driver Guidelines</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-extrabold text-white uppercase mb-4 tracking-wider">Platform Partners</h5>
            <ul className="space-y-2.5 font-medium">
              <li><Link href="#" className="hover:text-white hover:underline">Stripe Checkout</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Chapa Integration</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Telebirr Wallet</Link></li>
              <li><Link href="#" className="hover:text-white hover:underline">Twilio API</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h5 className="font-extrabold text-white uppercase mb-4 tracking-wider">Sooqly Apps</h5>
            <p className="mb-3.5 text-zinc-500 font-medium">Shop on-the-go with our upcoming Android and iOS e-commerce applications.</p>
            <div className="flex gap-2.5">
              <span className="bg-zinc-800 text-white px-3 py-1.5 rounded-lg font-bold border border-zinc-700">App Store</span>
              <span className="bg-zinc-800 text-white px-3 py-1.5 rounded-lg font-bold border border-zinc-700">Google Play</span>
            </div>
          </div>
        </div>

        {/* Payment Gateways / Rights */}
        <div className="max-w-7xl mx-auto px-4 border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-zinc-500 font-medium">
            <span>Payment Methods:</span>
            <span className="bg-zinc-850 px-2 py-1 rounded text-[10px] text-zinc-300">VISA</span>
            <span className="bg-zinc-850 px-2 py-1 rounded text-[10px] text-zinc-300">Mastercard</span>
            <span className="bg-zinc-850 px-2 py-1 rounded text-[10px] text-zinc-300">Stripe</span>
            <span className="bg-zinc-850 px-2 py-1 rounded text-[10px] text-zinc-300">Chapa</span>
            <span className="bg-zinc-850 px-2 py-1 rounded text-[10px] text-zinc-300">Telebirr</span>
          </div>
          <p className="text-zinc-500 font-medium">
            &copy; {new Date().getFullYear()} Sooqly Plus Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

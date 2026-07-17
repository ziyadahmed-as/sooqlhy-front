"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Heart, User, Bell, Menu, X, ChevronRight,
  ArrowRight, Truck, RotateCcw, Headphones, Star, Flame, Tag,
  Gift, CheckCircle, ShieldCheck, Sparkles, ChevronLeft, LogOut,
  Package, Zap, TrendingUp, Clock, Award, Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useUIStore } from "@/stores/ui-store";
import { fetchCategories, fetchCatalog } from "@/lib/api/catalog";
import { fetchFlashSales } from "@/lib/api/promotions";
import type { Category, Product, FlashSale } from "@/lib/types";
import { toast } from "sonner";
import ProductCard from "@/components/shared/ProductCard";
import QuickViewModal from "@/components/shared/QuickViewModal";

const HERO_SLIDES = [
  { title: "Super Tech Deals", subtitle: "Smartphones, wearables & audio — up to 50% off", cta: "Shop Electronics", href: "/buyer/catalog?category=electronics", gradient: "from-slate-900 via-blue-950 to-indigo-950", badge: "🔥 Hot Deal" },
  { title: "Fashion Carnival", subtitle: "Streetwear, activewear & seasonal styles — up to 70% off", cta: "Shop Fashion", href: "/buyer/catalog?category=fashion", gradient: "from-rose-950 via-pink-950 to-orange-950", badge: "✨ Trending" },
  { title: "Smart Home Sale", subtitle: "Lighting, security & intelligent living systems", cta: "Shop Home", href: "/buyer/catalog?category=home", gradient: "from-violet-950 via-purple-950 to-blue-950", badge: "🆕 New Arrivals" },
];

const TRUST_FEATURES = [
  { icon: ShieldCheck, title: "Secure Payments", desc: "Escrow protection on every order" },
  { icon: Truck,       title: "Fast Delivery",   desc: "Verified drivers assigned per order" },
  { icon: RotateCcw,   title: "Easy Returns",    desc: "7-day hassle-free return policy" },
  { icon: Headphones,  title: "24/7 Support",    desc: "Live chat & phone support" },
];

const TESTIMONIALS = [
  { name: "Amara T.", role: "Verified Buyer", text: "Best marketplace I've used. Fast delivery and quality products every time!", rating: 5, avatar: "A" },
  { name: "Kebede M.", role: "Verified Buyer", text: "Sooqly made buying electronics so easy. Genuine products and great prices.", rating: 5, avatar: "K" },
  { name: "Sara H.", role: "Verified Buyer", text: "Love the buyer protection! My orders always arrive exactly as described.", rating: 5, avatar: "S" },
];

// ─── Announcement Bar ─────────────────────────────────────────────────────────
function AnnouncementBar({ sale }: { sale: FlashSale | null }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-navy text-white text-xs font-medium py-2 px-4 flex items-center justify-center gap-3 relative">
      <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0 animate-pulse" />
      <span className="text-center">{sale ? `🔥 ${sale.name} — ${sale.discount_percentage}% OFF! Limited time.` : "Free shipping on orders over $25 · Verified vendors · Buyer protection on every order"}</span>
      <Link href="/buyer/catalog" className="font-bold underline hover:text-gold transition-colors ml-2 whitespace-nowrap">Shop Now →</Link>
      <button onClick={() => setVisible(false)} className="absolute right-3 text-white/50 hover:text-white" aria-label="Dismiss"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Topbar({ searchQuery, onSearchChange, onSearchSubmit, categories, cartCount, unreadCount }:
  { searchQuery: string; onSearchChange: (v: string) => void; onSearchSubmit: (e: React.FormEvent) => void; categories: Category[]; cartCount: number; unreadCount: number }) {
  const { user, logout } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const roleHome: Record<string, string> = { buyer: "/buyer/catalog", vendor: "/vendor/dashboard", driver: "/driver/dashboard", moderator: "/moderator/dashboard", admin: "/admin/dashboard", super_admin: "/super_admin/dashboard" };
  const dashHref = user ? (roleHome[user.role?.toLowerCase() ?? ""] ?? "/") : "/";

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center"><Flame className="w-4 h-4 text-gold fill-gold" /></div>
          <span className="text-xl font-black text-navy tracking-tight">Sooqly</span>
        </Link>
        <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-navy cursor-pointer select-none group relative">
          <Menu className="w-4 h-4" /><span>Categories</span><ChevronRight className="w-3.5 h-3.5 rotate-90" />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
            {categories.slice(0, 12).map((c) => (
              <Link key={c.id} href={`/buyer/catalog?category=${c.id}`} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy">{c.name}<ChevronRight className="w-3.5 h-3.5 text-gray-400" /></Link>
            ))}
            <div className="border-t mt-1 pt-1"><Link href="/buyer/catalog" className="flex items-center px-4 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white rounded-b-xl">View All <ArrowRight className="ml-auto w-4 h-4" /></Link></div>
          </div>
        </div>
        <form onSubmit={onSearchSubmit} className="flex-1 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="search" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search products, brands, categories…"
              className="w-full pl-10 pr-28 py-2.5 text-sm rounded-full border-2 border-gray-200 focus:border-navy focus:outline-none bg-gray-50 focus:bg-white transition-colors" aria-label="Search" />
            <button type="submit" className="absolute right-1.5 h-8 px-4 rounded-full bg-navy text-white text-xs font-semibold hover:bg-trust transition-colors">Search</button>
          </div>
        </form>
        <div className="hidden md:flex items-center gap-1">
          <Link href="/buyer/catalog" className="p-2 rounded-lg text-gray-500 hover:text-navy hover:bg-gray-100" aria-label="Wishlist"><Heart className="w-5 h-5" /></Link>
          <Link href="/buyer/cart" className="relative p-2 rounded-lg text-gray-500 hover:text-navy hover:bg-gray-100" aria-label="Cart">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
          {user && <button className="relative p-2 rounded-lg text-gray-500 hover:text-navy hover:bg-gray-100" aria-label="Notifications"><Bell className="w-5 h-5" />{unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black">{unreadCount}</span>}</button>}
          {user ? (
            <div className="relative group ml-1">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">{(user.name || user.email).charAt(0).toUpperCase()}</div>
                <span className="font-medium text-navy max-w-[100px] truncate">{user.name || user.email.split("@")[0]}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-90" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
                <Link href={dashHref} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><User className="w-4 h-4" /> Dashboard</Link>
                <Link href="/buyer/orders" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Package className="w-4 h-4" /> My Orders</Link>
                <div className="border-t mt-1 pt-1"><button onClick={async () => { await logout(); toast.success("Signed out"); router.push("/"); }} className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Sign Out</button></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <button onClick={() => openAuthModal("login")} className="px-4 py-2 text-sm font-semibold text-navy hover:text-trust">Sign In</button>
              <button onClick={() => openAuthModal("register")} className="px-4 py-2 text-sm font-semibold bg-navy text-white rounded-lg hover:bg-trust transition-colors">Register</button>
            </div>
          )}
        </div>
        <button className="md:hidden ml-auto p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      <AnimatePresence>{mobileOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-gray-100 bg-white overflow-hidden">
          <div className="px-4 py-4 space-y-2">
            <form onSubmit={(e) => { onSearchSubmit(e); setMobileOpen(false); }} className="mb-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="search" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search…" className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-navy focus:outline-none bg-gray-50" /></div></form>
            {user ? (<><Link href={dashHref} className="flex items-center gap-2 py-2 text-sm font-medium text-navy" onClick={() => setMobileOpen(false)}><User className="w-4 h-4" /> Dashboard</Link><Link href="/buyer/cart" className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}><ShoppingCart className="w-4 h-4" /> Cart {cartCount > 0 && `(${cartCount})`}</Link><button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 py-2 text-sm font-medium text-red-600 w-full"><LogOut className="w-4 h-4" /> Sign Out</button></>) : (
              <div className="flex gap-2 pt-1"><button onClick={() => { openAuthModal("login"); setMobileOpen(false); }} className="flex-1 py-2.5 text-sm font-semibold border border-navy text-navy rounded-lg hover:bg-navy hover:text-white transition-colors">Sign In</button><button onClick={() => { openAuthModal("register"); setMobileOpen(false); }} className="flex-1 py-2.5 text-sm font-semibold bg-navy text-white rounded-lg hover:bg-trust transition-colors">Register</button></div>
            )}
          </div>
        </motion.div>
      )}</AnimatePresence>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ categories, flashSale }: { categories: Category[]; flashSale: FlashSale | null }) {
  const [slide, setSlide] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  useEffect(() => { const t = setInterval(() => setSlide((p) => (p + 1) % HERO_SLIDES.length), 5500); return () => clearInterval(t); }, []);
  const cur = HERO_SLIDES[slide];
  return (
    <section className="max-w-7xl mx-auto px-4 mt-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="hidden lg:block lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-full overflow-hidden">
            <div className="px-3 py-2.5 border-b border-gray-100"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Categories</span></div>
            <ul className="py-1">{categories.slice(0, 10).map((c) => (<li key={c.id}><Link href={`/buyer/catalog?category=${c.id}`} className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy"><span className="truncate">{c.name}</span><ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" /></Link></li>))}{categories.length === 0 && <li className="px-3 py-3 text-xs text-gray-400">Loading…</li>}</ul>
          </div>
        </aside>
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden h-[340px] sm:h-[400px] bg-navy group">
          <AnimatePresence mode="wait"><motion.div key={slide} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }} className={`absolute inset-0 bg-gradient-to-br ${cur.gradient}`} /></AnimatePresence>
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
            <AnimatePresence mode="wait"><motion.div key={`c-${slide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">{flashSale ? `${flashSale.discount_percentage}% OFF` : cur.badge}</span>
              <h2 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">{cur.title}</h2>
              <p className="text-white/75 text-sm sm:text-base mb-5 max-w-md">{cur.subtitle}</p>
              <Link href={cur.href} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy rounded-xl text-sm font-bold hover:bg-gold hover:text-white transition-all shadow-lg">{cur.cta} <ArrowRight className="w-4 h-4" /></Link>
            </motion.div></AnimatePresence>
          </div>
          <button onClick={() => setSlide((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 z-20" aria-label="Prev"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setSlide((p) => (p + 1) % HERO_SLIDES.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 z-20" aria-label="Next"><ChevronRight className="w-5 h-5" /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">{HERO_SLIDES.map((_, i) => (<button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} aria-label={`Slide ${i + 1}`} />))}</div>
        </div>
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-navy to-trust flex items-center justify-center text-white font-bold flex-shrink-0">{user ? (user.name || user.email).charAt(0).toUpperCase() : "?"}</div>
              <div className="min-w-0"><p className="text-sm font-bold text-navy truncate">{user ? `Hello, ${user.name || user.email.split("@")[0]}` : "Welcome to Sooqly"}</p><p className="text-xs text-gray-400">{user ? `${user.role} account` : "Sign in for exclusive deals"}</p></div>
            </div>
            {user ? <Link href={`/${user.role?.toLowerCase() ?? ""}/dashboard`} className="block text-center py-2.5 bg-navy text-white text-xs font-bold rounded-lg hover:bg-trust">Go to Dashboard</Link> : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => openAuthModal("login")} className="py-2.5 text-xs font-bold border-2 border-navy text-navy rounded-lg hover:bg-navy hover:text-white transition-colors">Sign In</button>
                <button onClick={() => openAuthModal("register")} className="py-2.5 text-xs font-bold bg-navy text-white rounded-lg hover:bg-trust transition-colors">Register</button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-gray-100">{[["10k+", "Vendors"], ["24/7", "Support"], ["100%", "Secure"]].map(([v, l]) => (<div key={l} className="text-center py-1"><p className="text-sm font-black text-navy">{v}</p><p className="text-[9px] text-gray-400 uppercase tracking-wider">{l}</p></div>))}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center flex-shrink-0"><Gift className="w-4 h-4" /></div>
              <div><p className="text-xs font-black text-red-600 uppercase tracking-wider">Newcomer Exclusive</p><p className="text-lg font-black text-gray-900 leading-tight">{flashSale ? `${flashSale.discount_percentage}% Off` : "Welcome Voucher"}</p><p className="text-[11px] text-gray-500">{flashSale ? flashSale.name : "Valid on your first purchase"}</p></div>
            </div>
            {claimed ? <div className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-500"><CheckCircle className="w-4 h-4 text-green-500" /> Claimed!</div> : <button onClick={() => { setClaimed(true); toast.success("Voucher claimed!"); }} className="py-2.5 text-xs font-black bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:opacity-90">Claim Now</button>}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TRUST_FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-navy" /></div>
            <div><p className="text-xs font-bold text-gray-900">{title}</p><p className="text-[11px] text-gray-400 leading-tight">{desc}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, href, children, loading }: { title: string; icon: React.ReactNode; href: string; children: React.ReactNode; loading?: boolean }) {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-navy flex items-center gap-2">{icon}{title}</h2>
        <Link href={href} className="text-sm font-semibold text-trust hover:text-navy flex items-center gap-1 transition-colors">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-60" />)}
        </div>
      ) : children}
    </section>
  );
}

function ProductGrid({ products, onQuickView }: { products: Product[]; onQuickView: (p: Product) => void }) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {products.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />)}
    </div>
  );
}

// ─── Categories Grid ──────────────────────────────────────────────────────────
function CategoriesSection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  const colors = ["bg-blue-50 text-blue-700", "bg-purple-50 text-purple-700", "bg-pink-50 text-pink-700", "bg-amber-50 text-amber-700", "bg-emerald-50 text-emerald-700", "bg-sky-50 text-sky-700", "bg-rose-50 text-rose-700", "bg-indigo-50 text-indigo-700"];
  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-navy flex items-center gap-2"><Tag className="w-5 h-5 text-gold" /> Featured Categories</h2>
        <Link href="/buyer/catalog" className="text-sm font-semibold text-trust hover:text-navy flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.slice(0, 8).map((c, i) => (
          <Link key={c.id} href={`/buyer/catalog?category=${c.id}`}
            className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border border-transparent hover:border-gray-200 hover:shadow-sm transition-all ${colors[i % colors.length]}`}>
            <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center"><Tag className="w-5 h-5" /></div>
            <span className="text-xs font-bold text-center leading-tight">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-navy flex items-center justify-center gap-2"><Users className="w-6 h-6 text-gold" /> What Our Customers Say</h2>
        <p className="text-sm text-gray-500 mt-1">Trusted by thousands of buyers across Africa</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TESTIMONIALS.map(({ name, role, text, rating, avatar }) => (
          <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
            <div className="flex gap-0.5">{Array.from({ length: rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
            <p className="text-sm text-gray-700 leading-relaxed flex-1">"{text}"</p>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-black">{avatar}</div>
              <div><p className="text-sm font-bold text-gray-900">{name}</p><p className="text-xs text-gray-400">{role}</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="max-w-7xl mx-auto px-4 mt-16">
      <div className="bg-gradient-to-br from-navy to-trust rounded-2xl p-8 sm:p-12 text-white text-center">
        <Award className="w-10 h-10 text-gold mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">Get Exclusive Deals First</h2>
        <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">Subscribe for flash sales, promo codes, and curated picks — delivered to your inbox.</p>
        {done ? (
          <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold"><CheckCircle className="w-5 h-5" /> You're subscribed!</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (email) { setDone(true); toast.success("Subscribed!"); }}} className="flex gap-2 max-w-sm mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none" required />
            <button type="submit" className="px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const links = [
    { title: "Shop", items: [["All Products", "/buyer/catalog"], ["Flash Sales", "/buyer/catalog?flash=true"], ["New Arrivals", "/buyer/catalog?ordering=-created_at"], ["Top Rated", "/buyer/catalog?ordering=-average_rating"]] },
    { title: "Sell", items: [["Become a Vendor", "/vendor/register"], ["Vendor Dashboard", "/vendor/dashboard"], ["Commission Rates", "#"], ["Vendor Support", "#"]] },
    { title: "Support", items: [["Help Center", "#"], ["Dispute Resolution", "#"], ["Contact Us", "#"], ["Privacy Policy", "#"]] },
  ];
  return (
    <footer className="bg-navy text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center"><Flame className="w-4 h-4 text-gold" /></div><span className="text-lg font-black">Sooqly</span></div>
          <p className="text-white/50 text-xs leading-relaxed">Next-generation multi-vendor marketplace. Shop with confidence.</p>
        </div>
        {links.map(({ title, items }) => (
          <div key={title}><p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">{title}</p><ul className="space-y-2">{items.map(([label, href]) => (<li key={label}><Link href={href} className="text-xs text-white/60 hover:text-white transition-colors">{label}</Link></li>))}</ul></div>
        ))}
      </div>
      <div className="border-t border-white/10"><div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30"><p>© {new Date().getFullYear()} Sooqly. All rights reserved.</p><p>Built with ❤️ for buyers &amp; vendors worldwide</p></div></div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRated, setLoadingRated] = useState(true);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchFlashSales().then((sales) => {
      const now = Date.now();
      setFlashSale(sales.find((s) => s.is_active && new Date(s.start_time).getTime() <= now && new Date(s.end_time).getTime() >= now) ?? null);
    }).catch(() => {});

    fetchCatalog({ is_featured: true, page_size: 10 })
      .then((r) => setFeatured(r.results ?? [])).catch(() => {}).finally(() => setLoadingFeatured(false));

    fetchCatalog({ ordering: "-average_rating", page_size: 10 })
      .then((r) => setTopRated(r.results ?? [])).catch(() => {}).finally(() => setLoadingRated(false));

    fetchCatalog({ ordering: "-add_to_cart_count", page_size: 10 })
      .then((r) => setBestSellers(r.results ?? [])).catch(() => {}).finally(() => setLoadingSellers(false));

    fetchCatalog({ ordering: "-created_at", page_size: 10 })
      .then((r) => setNewArrivals(r.results ?? [])).catch(() => {}).finally(() => setLoadingNew(false));
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/buyer/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
  }, [searchQuery, router]);

  const cartCount = cartItems.reduce((acc: number, i: any) => acc + (i.quantity ?? 1), 0);

  return (
    <div className="min-h-screen bg-surface">
      <AnnouncementBar sale={flashSale} />
      <Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearchSubmit={handleSearch} categories={categories} cartCount={cartCount} unreadCount={unreadCount} />
      <main>
        <HeroSection categories={categories} flashSale={flashSale} />
        <TrustBar />

        <Section title="Promoted Products" icon={<Sparkles className="w-5 h-5 text-gold" />} href="/buyer/catalog?is_featured=true" loading={loadingFeatured}>
          <ProductGrid products={featured} onQuickView={setQuickViewProduct} />
        </Section>

        <Section title="Highest Rated" icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />} href="/buyer/catalog?ordering=-average_rating" loading={loadingRated}>
          <ProductGrid products={topRated} onQuickView={setQuickViewProduct} />
        </Section>

        <Section title="Weekly Best Sellers" icon={<TrendingUp className="w-5 h-5 text-trust" />} href="/buyer/catalog?ordering=-add_to_cart_count" loading={loadingSellers}>
          <ProductGrid products={bestSellers} onQuickView={setQuickViewProduct} />
        </Section>

        <Section title="New Arrivals" icon={<Zap className="w-5 h-5 text-emerald-500" />} href="/buyer/catalog?ordering=-created_at" loading={loadingNew}>
          <ProductGrid products={newArrivals} onQuickView={setQuickViewProduct} />
        </Section>

        <CategoriesSection categories={categories} />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}

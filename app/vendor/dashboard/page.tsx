"use client";
import { useEffect, useState, useCallback } from "react";
import { VendorGuard } from "@/components/layout/VendorGuard";
import Link from "next/link";
import {
  Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle,
  Plus, Eye, Star, Bell, Clock, CheckCircle, XCircle,
  BarChart2, Layers, RefreshCw, ArrowRight, Zap, Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  fetchVendorStats,
  fetchVendorProducts,
  fetchLowStockProducts,
  fetchVendorProductStats,
  type VendorProductStats,
} from "@/lib/api/vendor";
import { fetchVendorOrders } from "@/lib/api/orders";
import type { VendorStats, VendorProduct, VendorOrder } from "@/lib/types";
import { SkeletonMetricCard } from "@/components/shared/SkeletonCard";
import { cn } from "@/lib/utils";

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  APPROVED:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  DRAFT:        "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  SUBMITTED:    "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  REJECTED:     "bg-red-50 text-red-700 ring-1 ring-red-200",
  ARCHIVED:     "bg-gray-100 text-gray-400 ring-1 ring-gray-200",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600")}>
      {status.replace("_", " ")}
    </span>
  );
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED:    "bg-purple-50 text-purple-700",
  DELIVERED:  "bg-emerald-50 text-emerald-700",
  CANCELLED:  "bg-red-50 text-red-700",
  REFUNDED:   "bg-gray-100 text-gray-500",
};

// ─── Metric card ──────────────────────────────────────────────────────────────
interface MetricProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
  href?: string;
  alert?: boolean;
}

function MetricCard({ title, value, icon, iconBg, sub, href, alert }: MetricProps) {
  const inner = (
    <div className={cn(
      "relative bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group",
      alert ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:-translate-y-0.5"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          {icon}
        </div>
        {href && <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-navy transition-colors" />}
      </div>
      <p className={cn("text-2xl font-black", alert ? "text-red-600" : "text-navy")}>{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-0.5">{title}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, icon, href, linkLabel = "View All" }: {
  title: string; icon: React.ReactNode; href?: string; linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-black text-navy flex items-center gap-2">{icon}{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-semibold text-trust hover:text-navy flex items-center gap-1 transition-colors">
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function VendorDashboardContent() {
  const { user } = useAuthStore();

  const [productStats, setProductStats]     = useState<VendorProductStats | null>(null);
  const [orderStats, setOrderStats]         = useState<VendorStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<VendorProduct[]>([]);
  const [lowStock, setLowStock]             = useState<VendorProduct[]>([]);
  const [recentOrders, setRecentOrders]     = useState<VendorOrder[]>([]);
  const [loading, setLoading]               = useState(true);

  const vendorName = user?.name || (user as any)?.first_name || user?.email?.split("@")[0] || "Vendor";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pStats, oStats, products, ls, orders] = await Promise.allSettled([
        fetchVendorProductStats(),
        fetchVendorStats(),
        fetchVendorProducts({ page_size: 5 }),
        fetchLowStockProducts(),
        fetchVendorOrders({ page_size: 5 }),
      ]);

      if (pStats.status === "fulfilled")    setProductStats(pStats.value);
      if (oStats.status === "fulfilled")    setOrderStats(oStats.value);
      if (products.status === "fulfilled")  setRecentProducts(products.value);
      if (ls.status === "fulfilled")        setLowStock(ls.value);
      if (orders.status === "fulfilled")    setRecentOrders(orders.value.results ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 font-medium">Vendor Dashboard</p>
            <h1 className="text-xl font-black text-navy">Welcome back, {vendorName} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-navy transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/vendor/products/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white text-sm font-bold rounded-xl hover:bg-trust transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ── Metric Cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonMetricCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              title="Total Products"
              value={productStats?.total ?? 0}
              icon={<Package className="w-5 h-5 text-navy" />}
              iconBg="bg-navy/10"
              href="/vendor/products"
            />
            <MetricCard
              title="Active Products"
              value={productStats?.active ?? 0}
              icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
              sub="Approved & live"
            />
            <MetricCard
              title="Pending Review"
              value={productStats?.pending ?? 0}
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              iconBg="bg-amber-50"
              sub="Awaiting moderation"
            />
            <MetricCard
              title="Out of Stock"
              value={productStats?.out_of_stock ?? 0}
              icon={<XCircle className="w-5 h-5 text-red-500" />}
              iconBg="bg-red-50"
              alert={(productStats?.out_of_stock ?? 0) > 0}
            />
            <MetricCard
              title="Low Stock"
              value={productStats?.low_stock ?? 0}
              icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
              iconBg="bg-orange-50"
              alert={(productStats?.low_stock ?? 0) > 0}
            />
            <MetricCard
              title="Total Revenue"
              value={`$${((orderStats as any)?.total_sales ?? (orderStats as any)?.totalRevenue ?? 0).toFixed(2)}`}
              icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
              sub="All time"
            />
          </div>
        )}

        {/* ── Revenue + Orders Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Orders This Month"
            value={orderStats?.ordersThisMonth ?? (orderStats as any)?.orders_this_month ?? 0}
            icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            href="/vendor/orders"
          />
          <MetricCard
            title="Pending Orders"
            value={orderStats?.pendingOrders ?? (orderStats as any)?.pending_orders ?? 0}
            icon={<Zap className="w-5 h-5 text-amber-500" />}
            iconBg="bg-amber-50"
            href="/vendor/orders"
            alert={(orderStats?.pendingOrders ?? (orderStats as any)?.pending_orders ?? 0) > 0}
          />
          <MetricCard
            title="Draft Products"
            value={productStats?.draft ?? 0}
            icon={<Layers className="w-5 h-5 text-gray-500" />}
            iconBg="bg-gray-100"
            href="/vendor/products"
          />
        </div>

        {/* ── Low Stock Alerts ── */}
        {!loading && lowStock.length > 0 && (
          <div>
            <SectionHeader
              title="Low Stock Alerts"
              icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}
              href="/vendor/products"
            />
            <div className="bg-orange-50 border border-orange-100 rounded-2xl overflow-hidden">
              <div className="divide-y divide-orange-100">
                {lowStock.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-orange-100/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category_name || "Uncategorized"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-black text-orange-600">{p.stock} left</span>
                      <Link
                        href={`/vendor/products/${p.id}/edit`}
                        className="text-xs font-semibold text-trust hover:text-navy transition-colors"
                      >
                        Update
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Recent Products ── */}
          <div>
            <SectionHeader
              title="Recent Products"
              icon={<Package className="w-4 h-4 text-navy" />}
              href="/vendor/products"
            />
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-white rounded-xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">No products yet</p>
                <Link href="/vendor/products/new" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-trust">
                  <Plus className="w-3.5 h-3.5" /> Add your first product
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {recentProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">${Number(p.price).toFixed(2)} · Stock: {p.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusPill status={p.status || "DRAFT"} />
                        <Link
                          href={`/vendor/products/${p.id}/edit`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100"
                          title="Edit"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Recent Orders ── */}
          <div>
            <SectionHeader
              title="Recent Orders"
              icon={<ShoppingBag className="w-4 h-4 text-navy" />}
              href="/vendor/orders"
            />
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-white rounded-xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">No orders yet</p>
                <p className="text-xs text-gray-400 mt-1">Orders will appear here once customers start buying</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {recentOrders.map((o) => {
                    const orderNum = (o as any).order_number || `#${String(o.id).slice(0, 8).toUpperCase()}`;
                    const buyerName = (o as any).buyerName || (o as any).buyer_name || "Customer";
                    const total = o.total ?? (o as any).total_amount ?? 0;
                    return (
                      <div key={o.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{orderNum}</p>
                          <p className="text-xs text-gray-400 truncate">{buyerName}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-bold text-navy">${Number(total).toFixed(2)}</span>
                          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", ORDER_STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-500")}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <SectionHeader title="Quick Actions" icon={<Zap className="w-4 h-4 text-gold" />} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Add Product",     icon: Plus,      href: "/vendor/products/new",   bg: "bg-navy/5 hover:bg-navy/10" },
              { label: "View Orders",     icon: ShoppingBag, href: "/vendor/orders",        bg: "bg-blue-50 hover:bg-blue-100" },
              { label: "Analytics",       icon: BarChart2,  href: "/vendor/dashboard",      bg: "bg-purple-50 hover:bg-purple-100" },
              { label: "Finance",         icon: DollarSign, href: "/vendor/finance",        bg: "bg-emerald-50 hover:bg-emerald-100" },
            ].map(({ label, icon: Icon, href, bg }) => (
              <Link
                key={label}
                href={href}
                className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border border-transparent transition-all text-sm font-semibold text-gray-700", bg)}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Analytics Chart ── */}
        <div>
          <SectionHeader
            title="Sales Analytics"
            icon={<TrendingUp className="w-4 h-4 text-navy" />}
            href="/vendor/dashboard"
            linkLabel="Full Report"
          />
          {/* Lazy-load the heavy recharts component */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <AnalyticsSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lazy Analytics Block ─────────────────────────────────────────────────────
import dynamic from "next/dynamic";
const AnalyticsDashboard = dynamic(
  () => import("@/components/vendor/AnalyticsDashboard"),
  {
    loading: () => (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

function AnalyticsSummary() {
  return (
    <div className="p-5">
      <AnalyticsDashboard />
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function VendorDashboardPage() {
  return (
    <VendorGuard>
      <VendorDashboardContent />
    </VendorGuard>
  );
}

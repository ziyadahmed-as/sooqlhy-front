"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle,
  Plus, Eye, Star, Clock, CheckCircle, XCircle, BarChart2,
  Layers, RefreshCw, ArrowRight, Zap, Users, Box, Tag, Truck,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  fetchVendorStats, fetchVendorProducts, fetchLowStockProducts,
  fetchVendorProductStats, type VendorProductStats,
} from "@/lib/api/vendor";
import { fetchVendorOrders } from "@/lib/api/orders";
import { fetchVendorAnalytics } from "@/lib/api/analytics";
import type { VendorStats, VendorProduct, VendorOrder, AnalyticsData } from "@/lib/types";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { cn } from "@/lib/utils";

// Lazy-load heavy chart component
const AnalyticsDashboard = dynamic(
  () => import("@/components/vendor/AnalyticsDashboard"),
  { ssr: false, loading: () => <div className="h-60 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div> }
);

function SectionCard({ title, icon, href, children }: {
  title: string; icon: React.ReactNode; href?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-gray-400">{icon}</span>{title}
        </h3>
        {href && (
          <Link href={href} className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default function VendorDashboardPage() {
  const { user } = useAuthStore();
  const [productStats, setProductStats] = useState<VendorProductStats | null>(null);
  const [orderStats, setOrderStats]     = useState<VendorStats | null>(null);
  const [analytics, setAnalytics]       = useState<AnalyticsData | null>(null);
  const [recentProducts, setRecentProducts] = useState<VendorProduct[]>([]);
  const [lowStock, setLowStock]         = useState<VendorProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading]           = useState(true);

  const vendorName =
    (user as any)?.first_name
      ? `${(user as any).first_name} ${(user as any).last_name ?? ""}`.trim()
      : user?.name || user?.email?.split("@")[0] || "Vendor";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetchVendorProductStats(),
        fetchVendorStats(),
        fetchVendorProducts({ page_size: "6" }),
        fetchLowStockProducts(),
        fetchVendorOrders({ page_size: 5 }),
        fetchVendorAnalytics(),
      ]);
      if (results[0].status === "fulfilled") setProductStats(results[0].value);
      if (results[1].status === "fulfilled") setOrderStats(results[1].value);
      if (results[2].status === "fulfilled") setRecentProducts(results[2].value);
      if (results[3].status === "fulfilled") setLowStock(results[3].value);
      if (results[4].status === "fulfilled") setRecentOrders(results[4].value.results ?? []);
      if (results[5].status === "fulfilled") setAnalytics(results[5].value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = (orderStats as any)?.total_sales ?? (orderStats as any)?.totalRevenue ?? 0;
  const pendingOrders = (orderStats as any)?.pending_count ?? (orderStats as any)?.pendingOrders ?? 0;
  const totalOrders = (orderStats as any)?.order_count ?? (orderStats as any)?.ordersThisMonth ?? 0;

  return (
    <VendorPageWrapper
      title={`Welcome back, ${vendorName} 👋`}
      subtitle="Here's what's happening with your store today."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <Link
            href="/vendor/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      }
    >
      {/* ── KPI Cards Row 1 — Products ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <DashboardCard title="Total Products" value={productStats?.total ?? 0} icon={<Package className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" href="/vendor/products" loading={loading} />
          <DashboardCard title="Active" value={productStats?.active ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" loading={loading} />
          <DashboardCard title="Draft" value={productStats?.draft ?? 0} icon={<Layers className="w-5 h-5" />} iconBg="bg-gray-100 dark:bg-gray-800" iconColor="text-gray-500" href="/vendor/products?status=DRAFT" loading={loading} />
          <DashboardCard title="Pending Review" value={productStats?.pending ?? 0} icon={<Clock className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" loading={loading} />
          <DashboardCard title="Out of Stock" value={productStats?.out_of_stock ?? 0} icon={<XCircle className="w-5 h-5" />} iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-500" alert={(productStats?.out_of_stock ?? 0) > 0} loading={loading} />
          <DashboardCard title="Low Stock" value={productStats?.low_stock ?? 0} icon={<AlertTriangle className="w-5 h-5" />} iconBg="bg-orange-50 dark:bg-orange-900/20" iconColor="text-orange-500" alert={(productStats?.low_stock ?? 0) > 0} loading={loading} />
        </div>
      </div>

      {/* ── KPI Cards Row 2 — Orders & Revenue ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Orders & Revenue</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <DashboardCard title="Total Orders" value={totalOrders} icon={<ShoppingBag className="w-5 h-5" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-600" href="/vendor/orders" loading={loading} />
          <DashboardCard title="Pending Orders" value={pendingOrders} icon={<Zap className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" href="/vendor/orders?status=PENDING" alert={pendingOrders > 0} loading={loading} />
          <DashboardCard title="Monthly Revenue" value={`$${Number(analytics?.revenue_month ?? 0).toFixed(2)}`} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" loading={loading} />
          <DashboardCard title="Total Revenue" value={`$${Number(totalRevenue).toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" href="/vendor/finance" loading={loading} />
          <DashboardCard title="Avg Order Value" value={`$${Number(analytics?.average_order_value ?? 0).toFixed(2)}`} icon={<BarChart2 className="w-5 h-5" />} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600" loading={loading} />
        </div>
      </div>

      {/* ── KPI Cards Row 3 — Customers & Engagement ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Engagement</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DashboardCard title="Customer Satisfaction" value={`${Number(analytics?.customer_satisfaction ?? 0).toFixed(1)} / 5`} icon={<Star className="w-5 h-5" />} iconBg="bg-yellow-50 dark:bg-yellow-900/20" iconColor="text-yellow-500" loading={loading} />
          <DashboardCard title="Delivery Rating" value={`${Number(analytics?.delivery_rating ?? 0).toFixed(1)} / 5`} icon={<Truck className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-500" loading={loading} />
          <DashboardCard title="Top Products" value={analytics?.top_selling_products?.length ?? 0} icon={<Tag className="w-5 h-5" />} iconBg="bg-pink-50 dark:bg-pink-900/20" iconColor="text-pink-500" href="/vendor/analytics" loading={loading} />
          <DashboardCard title="Product Insights" value={analytics?.product_insights?.length ?? 0} icon={<Eye className="w-5 h-5" />} iconBg="bg-violet-50 dark:bg-violet-900/20" iconColor="text-violet-500" href="/vendor/analytics" loading={loading} />
        </div>
      </div>

      {/* ── Low Stock Alerts ── */}
      {!loading && lowStock.length > 0 && (
        <SectionCard title="Low Stock Alerts" icon={<AlertTriangle className="w-4 h-4" />} href="/vendor/inventory">
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-orange-50/40 dark:hover:bg-orange-900/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <Box className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category_name || "Uncategorized"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{p.stock} left</span>
                  <Link href={`/vendor/products/${p.id}/edit`} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">Update</Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Recent Products + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Recent Products" icon={<Package className="w-4 h-4" />} href="/vendor/products">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="py-10 text-center">
              <Package className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No products yet</p>
              <Link href="/vendor/products/new" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                <Plus className="w-3 h-3" /> Add your first product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">${Number(p.price).toFixed(2)} · {p.stock ?? 0} in stock</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={p.status || "DRAFT"} />
                    <Link href={`/vendor/products/${p.id}/edit`} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Orders" icon={<ShoppingBag className="w-4 h-4" />} href="/vendor/orders">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center">
              <ShoppingBag className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentOrders.map((o) => {
                const orderNum = (o as any).order_number || `#${String(o.id).slice(0, 8).toUpperCase()}`;
                const buyerName = (o as any).buyer_name || (o as any).buyerName || "Customer";
                const total = (o as any).total_amount ?? (o as any).total ?? 0;
                return (
                  <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{orderNum}</p>
                      <p className="text-xs text-gray-400 truncate">{buyerName}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">${Number(total).toFixed(2)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add Product", icon: Plus, href: "/vendor/products/new", bg: "hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-100 dark:border-blue-900/30", icon_c: "text-blue-600" },
            { label: "View Orders", icon: ShoppingBag, href: "/vendor/orders", bg: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30", icon_c: "text-indigo-600" },
            { label: "Assign Driver", icon: Truck, href: "/vendor/delivery/assign", bg: "hover:bg-teal-50 dark:hover:bg-teal-900/20 border-teal-100 dark:border-teal-900/30", icon_c: "text-teal-600" },
            { label: "Finance", icon: DollarSign, href: "/vendor/finance", bg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30", icon_c: "text-emerald-600" },
          ].map(({ label, icon: Icon, href, bg, icon_c }) => (
            <Link key={label} href={href} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300", bg)}>
              <Icon className={cn("w-5 h-5", icon_c)} />{label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Analytics Chart ── */}
      <SectionCard title="Sales Analytics" icon={<TrendingUp className="w-4 h-4" />} href="/vendor/analytics">
        <div className="p-5">
          <AnalyticsDashboard />
        </div>
      </SectionCard>
    </VendorPageWrapper>
  );
}

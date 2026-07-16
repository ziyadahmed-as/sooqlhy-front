"use client";
import { useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Users, Truck, ShoppingBag, MessageSquare, ShieldCheck,
  Package, RefreshCw, TrendingUp, CheckCircle, AlertTriangle,
  Clock, XCircle, MapPin, BarChart2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useModeratorStore } from "@/stores/moderator-store";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { cn } from "@/lib/utils";

export default function ModeratorDashboardPage() {
  const { user } = useAuthStore();
  const { stats, zones, statsLoading, loadAll } = useModeratorStore();

  const name = user
    ? `${(user as any).first_name ?? ""} ${(user as any).last_name ?? ""}`.trim() || user.email?.split("@")[0]
    : "Moderator";

  const refresh = useCallback(() => { loadAll(); }, [loadAll]);
  useEffect(() => { refresh(); }, [refresh]);

  const loading = statsLoading;

  return (
    <ModeratorPageWrapper
      title={`Welcome, ${name} 👋`}
      subtitle="Marketplace operations overview for your assigned zones."
      actions={
        <div className="flex items-center gap-2">
          {zones.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
              <MapPin className="w-3.5 h-3.5" />
              {zones.map((z) => z.zone_name).join(", ")}
            </div>
          )}
          <button onClick={refresh} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      }
    >
      {/* Pending alerts banner */}
      {!loading && ((stats?.pending_kyc_total ?? 0) > 0 || (stats?.product_queue ?? 0) > 0) && (
        <div className="flex flex-wrap gap-3">
          {(stats?.pending_kyc_total ?? 0) > 0 && (
            <Link href="/moderator/kyc-review" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 text-sm font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors">
              <ShieldCheck className="w-4 h-4" />{stats!.pending_kyc_total} KYC records pending review
            </Link>
          )}
          {(stats?.product_queue ?? 0) > 0 && (
            <Link href="/moderator/products" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors">
              <Package className="w-4 h-4" />{stats!.product_queue} products awaiting moderation
            </Link>
          )}
        </div>
      )}

      {/* Vendors */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Vendors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DashboardCard title="Total Vendors" value={stats?.total_vendors ?? 0} icon={<Users className="w-5 h-5" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-600" href="/moderator/vendors" loading={loading} />
          <DashboardCard title="Verified Vendors" value={stats?.active_vendors ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={loading} />
          <DashboardCard title="Pending KYC" value={stats?.pending_vendor_kyc ?? 0} icon={<ShieldCheck className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" href="/moderator/vendors/kyc" alert={(stats?.pending_vendor_kyc ?? 0) > 0} loading={loading} />
        </div>
      </div>

      {/* Drivers */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Drivers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DashboardCard title="Total Drivers" value={stats?.total_drivers ?? 0} icon={<Truck className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" href="/moderator/drivers" loading={loading} />
          <DashboardCard title="Verified Drivers" value={stats?.active_drivers ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={loading} />
          <DashboardCard title="Driver KYC Pending" value={stats?.pending_driver_kyc ?? 0} icon={<ShieldCheck className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" href="/moderator/drivers/kyc" alert={(stats?.pending_driver_kyc ?? 0) > 0} loading={loading} />
        </div>
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Orders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <DashboardCard title="Total Orders" value={stats?.total_orders ?? 0} icon={<ShoppingBag className="w-5 h-5" />} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600" href="/moderator/orders" loading={loading} />
          <DashboardCard title="Pending" value={stats?.pending_orders ?? 0} icon={<Clock className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" href="/moderator/orders?status=PENDING" alert={(stats?.pending_orders ?? 0) > 0} loading={loading} />
          <DashboardCard title="Processing" value={stats?.processing_orders ?? 0} icon={<BarChart2 className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" loading={loading} />
          <DashboardCard title="Delivered" value={stats?.delivered_orders ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={loading} />
          <DashboardCard title="Cancelled" value={stats?.cancelled_orders ?? 0} icon={<XCircle className="w-5 h-5" />} iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-500" loading={loading} />
        </div>
      </div>

      {/* Delivery + Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Delivery performance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />Delivery Performance
          </h3>
          {loading ? <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /> : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats?.delivery_success_rate ?? 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", (stats?.delivery_success_rate ?? 0) >= 80 ? "bg-green-500" : (stats?.delivery_success_rate ?? 0) >= 60 ? "bg-amber-400" : "bg-red-500")}
                  style={{ width: `${stats?.delivery_success_rate ?? 0}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 text-center">
                  <p className="text-xl font-black text-green-700 dark:text-green-400">{stats?.delivered_orders ?? 0}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Delivered</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 text-center">
                  <p className="text-xl font-black text-red-600 dark:text-red-400">{stats?.cancelled_orders ?? 0}</p>
                  <p className="text-xs text-red-500 dark:text-red-400">Cancelled</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Complaints */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />Complaints
            </h3>
            <Link href="/moderator/complaints" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">View All</Link>
          </div>
          {loading ? <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /> : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: stats?.total_complaints ?? 0, color: "text-gray-900 dark:text-white", bg: "bg-gray-50 dark:bg-gray-800" },
                { label: "Open", value: stats?.open_complaints ?? 0, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10", href: "/moderator/complaints?status=NEW" },
                { label: "Resolved", value: stats?.resolved_complaints ?? 0, color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10" },
              ].map(({ label, value, color, bg, href }) => (
                <Link key={label} href={href ?? "/moderator/complaints"} className={cn("rounded-lg p-3 text-center transition-colors hover:opacity-90", bg)}>
                  <p className={cn("text-2xl font-black", color)}>{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "KYC Review", icon: ShieldCheck, href: "/moderator/kyc-review", bg: "hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-100 dark:border-amber-900/30", iconC: "text-amber-600" },
            { label: "Products Queue", icon: Package, href: "/moderator/products", bg: "hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-100 dark:border-blue-900/30", iconC: "text-blue-600" },
            { label: "New Complaints", icon: MessageSquare, href: "/moderator/complaints?status=NEW", bg: "hover:bg-red-50 dark:hover:bg-red-900/20 border-red-100 dark:border-red-900/30", iconC: "text-red-500" },
            { label: "Manage Vendors", icon: Users, href: "/moderator/vendors", bg: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30", iconC: "text-indigo-600" },
          ].map(({ label, icon: Icon, href, bg, iconC }) => (
            <Link key={label} href={href} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300", bg)}>
              <Icon className={cn("w-5 h-5", iconC)} />{label}
            </Link>
          ))}
        </div>
      </div>
    </ModeratorPageWrapper>
  );
}

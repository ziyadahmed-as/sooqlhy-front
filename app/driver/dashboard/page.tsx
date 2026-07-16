"use client";
import { useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Truck, Package, Clock, CheckCircle, Navigation, Star,
  DollarSign, TrendingUp, RefreshCw, MapPin, Bell, User,
  BarChart2, Zap, History, AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useDriverStore } from "@/stores/driver-store";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("w-3.5 h-3.5", i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-gray-700")} />
      ))}
    </div>
  );
}

export default function DriverDashboardPage() {
  const { user } = useAuthStore();
  const { profile, stats, assignments, statsLoading, assignmentsLoading, loadStats, loadAssignments, toggleOnline } = useDriverStore();

  const driverName = user
    ? `${(user as any).first_name ?? ""} ${(user as any).last_name ?? ""}`.trim() || user.email?.split("@")[0]
    : "Driver";

  const refresh = useCallback(async () => {
    await Promise.allSettled([loadStats(), loadAssignments()]);
  }, [loadStats, loadAssignments]);

  useEffect(() => { refresh(); }, [refresh]);

  const isOnline = profile?.status === "AVAILABLE";

  const handleToggle = async () => {
    await toggleOnline();
    toast.success(isOnline ? "You are now Offline" : "You are now Online");
  };

  const loading = statsLoading;

  return (
    <DriverPageWrapper
      title={`Welcome back, ${driverName} 👋`}
      subtitle="Here's your delivery performance at a glance."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border",
              isOnline
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-500" : "bg-gray-400")} />
            {isOnline ? "Online" : "Offline"}
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      }
    >
      {/* ── Active Orders KPIs ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Active Orders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <DashboardCard title="Assigned" value={stats?.assigned ?? 0} icon={<Package className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" href="/driver/deliveries" loading={loading} />
          <DashboardCard title="Pending Requests" value={stats?.pending ?? 0} icon={<Bell className="w-5 h-5" />} iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-500" href="/driver/requests" alert={(stats?.pending ?? 0) > 0} loading={loading} />
          <DashboardCard title="Accepted" value={stats?.accepted ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" loading={loading} />
          <DashboardCard title="In Transit" value={stats?.in_transit ?? 0} icon={<Navigation className="w-5 h-5" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-600" loading={loading} />
          <DashboardCard title="Failed" value={stats?.failed_deliveries ?? 0} icon={<AlertCircle className="w-5 h-5" />} iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-500" loading={loading} />
          <DashboardCard title="Delivered" value={stats?.total_deliveries ?? 0} icon={<Truck className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" href="/driver/history" loading={loading} />
        </div>
      </div>

      {/* ── Delivery Volume ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Delivery Volume</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <DashboardCard title="Today" value={stats?.today_deliveries ?? 0} icon={<Zap className="w-5 h-5" />} iconBg="bg-orange-50 dark:bg-orange-900/20" iconColor="text-orange-500" loading={loading} />
          <DashboardCard title="This Week" value={stats?.weekly_deliveries ?? 0} icon={<BarChart2 className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-500" loading={loading} />
          <DashboardCard title="This Month" value={stats?.monthly_deliveries ?? 0} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" loading={loading} />
          <DashboardCard title="Total Deliveries" value={stats?.total_deliveries ?? 0} icon={<History className="w-5 h-5" />} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600" href="/driver/history" loading={loading} />
        </div>
      </div>

      {/* ── Earnings ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Earnings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DashboardCard title="Today's Earnings" value={`$${(stats?.today_earnings ?? 0).toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" loading={loading} />
          <DashboardCard title="This Week" value={`$${(stats?.weekly_earnings ?? 0).toFixed(2)}`} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" loading={loading} />
          <DashboardCard title="This Month" value={`$${(stats?.monthly_earnings ?? 0).toFixed(2)}`} icon={<BarChart2 className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" href="/driver/earnings" loading={loading} />
          <DashboardCard title="Total Earnings" value={`$${(stats?.total_earnings ?? 0).toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-600" href="/driver/earnings" loading={loading} />
        </div>
      </div>

      {/* ── Performance ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DashboardCard title="Avg Rating" value={`${(stats?.avg_rating ?? 0).toFixed(1)} / 5`} icon={<Star className="w-5 h-5" />} iconBg="bg-yellow-50 dark:bg-yellow-900/20" iconColor="text-yellow-500" href="/driver/ratings" loading={loading} />
          <DashboardCard title="On-Time Rate" value={`${(stats?.on_time_rate ?? 0).toFixed(0)}%`} icon={<Clock className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-500" loading={loading} />
          <DashboardCard title="Total Reviews" value={stats?.total_reviews ?? 0} icon={<Star className="w-5 h-5" />} iconBg="bg-pink-50 dark:bg-pink-900/20" iconColor="text-pink-500" href="/driver/ratings" loading={loading} />
        </div>
      </div>

      {/* ── Active Assignments + Recent Reviews ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active assignments */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" /> Active Assignments
            </h3>
            <Link href="/driver/deliveries" className="text-xs font-medium text-blue-600 hover:text-blue-800">View All</Link>
          </div>
          {assignmentsLoading ? (
            <div className="p-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          ) : assignments.length === 0 ? (
            <div className="py-10 text-center">
              <Truck className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No active assignments</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {assignments.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {order.shipping_address?.city ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={order.status} />
                    <Link href="/driver/deliveries" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Go</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-400" /> Recent Reviews
            </h3>
            <Link href="/driver/ratings" className="text-xs font-medium text-blue-600 hover:text-blue-800">View All</Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          ) : !stats?.recent_reviews?.length ? (
            <div className="py-10 text-center">
              <Star className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No reviews yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats.recent_reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {review.buyer__first_name} {review.buyer__last_name}
                    </p>
                    <RatingStars rating={review.rating} />
                  </div>
                  {review.comment && <p className="text-xs text-gray-500 line-clamp-2">{review.comment}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "View Requests", icon: Bell, href: "/driver/requests", bg: "hover:bg-red-50 dark:hover:bg-red-900/20 border-red-100 dark:border-red-900/30", iconC: "text-red-500" },
            { label: "My Deliveries", icon: Truck, href: "/driver/deliveries", bg: "hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-100 dark:border-blue-900/30", iconC: "text-blue-600" },
            { label: "Earnings", icon: DollarSign, href: "/driver/earnings", bg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30", iconC: "text-emerald-600" },
            { label: "My Profile", icon: User, href: "/driver/profile", bg: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30", iconC: "text-indigo-600" },
          ].map(({ label, icon: Icon, href, bg, iconC }) => (
            <Link key={label} href={href} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300", bg)}>
              <Icon className={cn("w-5 h-5", iconC)} />{label}
            </Link>
          ))}
        </div>
      </div>
    </DriverPageWrapper>
  );
}

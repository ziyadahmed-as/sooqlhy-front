"use client";
import { useEffect } from "react";
import { useModeratorStore } from "@/stores/moderator-store";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import { RefreshCw, Users, Truck, ShoppingBag, MessageSquare, TrendingUp, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModeratorAnalyticsPage() {
  const { stats, statsLoading, loadStats } = useModeratorStore();

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <ModeratorPageWrapper title="Zone Analytics" subtitle="Performance metrics for your assigned zones."
      actions={<button onClick={loadStats} disabled={statsLoading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", statsLoading && "animate-spin")} /></button>}>

      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Vendor Analytics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DashboardCard title="Total Vendors" value={stats?.total_vendors ?? 0} icon={<Users className="w-5 h-5" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-600" loading={statsLoading} />
          <DashboardCard title="Verified Vendors" value={stats?.active_vendors ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={statsLoading} />
          <DashboardCard title="Pending KYC" value={stats?.pending_vendor_kyc ?? 0} icon={<Users className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" loading={statsLoading} />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Driver Analytics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DashboardCard title="Total Drivers" value={stats?.total_drivers ?? 0} icon={<Truck className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" loading={statsLoading} />
          <DashboardCard title="Active Drivers" value={stats?.active_drivers ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={statsLoading} />
          <DashboardCard title="Driver KYC Pending" value={stats?.pending_driver_kyc ?? 0} icon={<Truck className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" loading={statsLoading} />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Order Analytics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <DashboardCard title="Total Orders" value={stats?.total_orders ?? 0} icon={<ShoppingBag className="w-5 h-5" />} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600" loading={statsLoading} />
          <DashboardCard title="Pending" value={stats?.pending_orders ?? 0} icon={<ShoppingBag className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" loading={statsLoading} />
          <DashboardCard title="Processing" value={stats?.processing_orders ?? 0} icon={<ShoppingBag className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" loading={statsLoading} />
          <DashboardCard title="Delivered" value={stats?.delivered_orders ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={statsLoading} />
          <DashboardCard title="Success Rate" value={`${stats?.delivery_success_rate ?? 0}%`} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" loading={statsLoading} />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Complaint Analytics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DashboardCard title="Total Complaints" value={stats?.total_complaints ?? 0} icon={<MessageSquare className="w-5 h-5" />} iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-500" loading={statsLoading} />
          <DashboardCard title="Open Complaints" value={stats?.open_complaints ?? 0} icon={<MessageSquare className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" loading={statsLoading} />
          <DashboardCard title="Resolved" value={stats?.resolved_complaints ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={statsLoading} />
        </div>
      </div>

      {/* Delivery performance bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />Delivery Success Rate
        </h3>
        {statsLoading ? <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /> : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{stats?.delivered_orders ?? 0} delivered / {(stats?.delivered_orders ?? 0) + (stats?.cancelled_orders ?? 0)} completed</span>
              <span className={cn("font-bold text-lg", (stats?.delivery_success_rate ?? 0) >= 80 ? "text-green-600" : (stats?.delivery_success_rate ?? 0) >= 60 ? "text-amber-500" : "text-red-500")}>{stats?.delivery_success_rate ?? 0}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-700", (stats?.delivery_success_rate ?? 0) >= 80 ? "bg-green-500" : (stats?.delivery_success_rate ?? 0) >= 60 ? "bg-amber-400" : "bg-red-500")}
                style={{ width: `${stats?.delivery_success_rate ?? 0}%` }} />
            </div>
          </div>
        )}
      </div>
    </ModeratorPageWrapper>
  );
}

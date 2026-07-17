"use client";
import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminStats, fetchAdminRevenueStats, fetchDailyAnalytics,
  fetchComplaintStats, type FullAdminStats, type RevenuePoint,
} from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import {
  Users, Store, Truck, ShoppingBag, DollarSign,
  TrendingUp, MessageSquare, RefreshCw, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Charts = dynamic(
  () => import("recharts").then((m) => {
    const { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = m;
    return function AllCharts({ revenue, analytics }: { revenue: RevenuePoint[]; analytics: any[] }) {
      return (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={((v: number) => [`$${v.toFixed(2)}`, "Revenue"]) as any} />
                <Bar dataKey="revenue" fill="#475569" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {analytics.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Platform Activity (14 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="page_views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Page Views" />
                  <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} dot={false} name="Registrations" />
                  <Line type="monotone" dataKey="conversions" stroke="#f59e0b" strokeWidth={2} dot={false} name="Conversions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /> }
);

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<FullAdminStats | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [complaintStats, setComplaintStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, a, c] = await Promise.allSettled([
        fetchAdminStats(), fetchAdminRevenueStats("monthly"),
        fetchDailyAnalytics(), fetchComplaintStats(),
      ]);
      if (s.status === "fulfilled") setStats(s.value);
      if (r.status === "fulfilled") setRevenue(r.value.data ?? []);
      if (a.status === "fulfilled") setAnalytics((a.value as any[]).slice(-14));
      if (c.status === "fulfilled") setComplaintStats(c.value);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminPageWrapper title="Platform Analytics" subtitle="Executive-level marketplace insights."
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Marketplace Growth</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DashboardCard title="Total Users" value={stats?.total_users ?? 0} icon={<Users className="w-5 h-5" />} iconBg="bg-slate-100 dark:bg-slate-900/40" iconColor="text-slate-700" loading={loading} />
          <DashboardCard title="Vendors" value={stats?.total_vendors ?? 0} icon={<Store className="w-5 h-5" />} iconBg="bg-violet-50 dark:bg-violet-900/20" iconColor="text-violet-600" loading={loading} />
          <DashboardCard title="Drivers" value={stats?.total_drivers ?? 0} icon={<Truck className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" loading={loading} />
          <DashboardCard title="Customers" value={stats?.total_buyers ?? 0} icon={<Users className="w-5 h-5" />} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" loading={loading} />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Commerce Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DashboardCard title="Total Orders" value={stats?.total_orders ?? 0} icon={<ShoppingBag className="w-5 h-5" />} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600" loading={loading} />
          <DashboardCard title="Delivered" value={stats?.delivered_orders ?? 0} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={loading} />
          <DashboardCard title="Cancelled" value={stats?.cancelled_orders ?? 0} icon={<BarChart2 className="w-5 h-5" />} iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-500" loading={loading} />
          <DashboardCard title="Total Revenue" value={`$${Number(stats?.total_revenue ?? 0).toFixed(0)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" loading={loading} />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Complaint Analytics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DashboardCard title="Total Complaints" value={complaintStats?.total ?? 0} icon={<MessageSquare className="w-5 h-5" />} iconBg="bg-orange-50 dark:bg-orange-900/20" iconColor="text-orange-500" loading={loading} />
          <DashboardCard title="Open" value={complaintStats?.new ?? 0} icon={<MessageSquare className="w-5 h-5" />} iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-500" loading={loading} />
          <DashboardCard title="Resolved" value={complaintStats?.resolved ?? 0} icon={<MessageSquare className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={loading} />
          <DashboardCard title="Resolution Rate" value={`${complaintStats?.resolution_rate ?? 0}%`} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" loading={loading} />
        </div>
      </div>

      {!loading && <Charts revenue={revenue} analytics={analytics} />}
    </AdminPageWrapper>
  );
}

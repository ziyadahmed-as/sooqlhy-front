"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Users, Store, Truck, ShieldCheck, Package, ShoppingBag,
  DollarSign, TrendingUp, MessageSquare, AlertTriangle,
  CheckCircle, Clock, XCircle, Activity, RefreshCw,
  Shield, BarChart2, FileText, Zap,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  fetchAdminStats, fetchAdminRevenueStats, fetchKycRecords,
  fetchAdminComplaints, fetchFinanceSummary,
  type FullAdminStats, type RevenuePoint,
} from "@/lib/api/admin";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

const RevenueChart = dynamic(
  () => import("recharts").then((m) => {
    const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = m;
    return function Chart({ data }: { data: RevenuePoint[] }) {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#475569" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#475569" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={((v: number) => [`$${v.toFixed(2)}`, "Revenue"]) as any} />
            <Area type="monotone" dataKey="revenue" stroke="#475569" fill="url(#rev)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-48 flex items-center justify-center"><div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /></div> }
);

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<FullAdminStats | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const name = user
    ? `${(user as any).first_name ?? ""} ${(user as any).last_name ?? ""}`.trim() || user.email?.split("@")[0]
    : "Admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, kyc, comp, fin] = await Promise.allSettled([
        fetchAdminStats(),
        fetchAdminRevenueStats(period),
        fetchKycRecords({ status: "PENDING", page: 1, page_size: 5 }),
        fetchAdminComplaints({ status: "NEW", page: 1, page_size: 5 }),
        fetchFinanceSummary(),
      ]);
      if (s.status === "fulfilled") setStats(s.value);
      if (r.status === "fulfilled") setRevenue(r.value.data ?? []);
      if (kyc.status === "fulfilled") setPendingKyc(kyc.value.results);
      if (comp.status === "fulfilled") setRecentComplaints(comp.value.results);
      if (fin.status === "fulfilled") setFinanceSummary(fin.value);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const isSuperAdmin = (user?.role ?? "").toUpperCase() === "SUPER_ADMIN";

  return (
    <AdminPageWrapper
      title={`Welcome back, ${name} ${isSuperAdmin ? "⚡" : "👋"}`}
      subtitle="Marketplace operations overview — real-time."
      actions={
        <div className="flex items-center gap-2">
          {(stats?.pending_kyc ?? 0) > 0 && (
            <Link href="/admin/kyc" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />{stats!.pending_kyc} KYC pending
            </Link>
          )}
          <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      }
    >
      {/* Users */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Marketplace Users</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <DashboardCard title="Total Users" value={stats?.total_users ?? 0} icon={<Users className="w-5 h-5" />} iconBg="bg-slate-100 dark:bg-slate-900/40" iconColor="text-slate-700 dark:text-slate-300" href="/admin/users" loading={loading} />
          <DashboardCard title="Vendors" value={stats?.total_vendors ?? 0} icon={<Store className="w-5 h-5" />} iconBg="bg-violet-50 dark:bg-violet-900/20" iconColor="text-violet-600" href="/admin/users?role=VENDOR" loading={loading} />
          <DashboardCard title="Drivers" value={stats?.total_drivers ?? 0} icon={<Truck className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" href="/admin/users?role=DRIVER" loading={loading} />
          <DashboardCard title="Moderators" value={stats?.total_moderators ?? 0} icon={<ShieldCheck className="w-5 h-5" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-600" href="/admin/users?role=MODERATOR" loading={loading} />
          <DashboardCard title="Customers" value={stats?.total_buyers ?? 0} icon={<Users className="w-5 h-5" />} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" href="/admin/users?role=BUYER" loading={loading} />
        </div>
      </div>

      {/* Commerce */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Commerce</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <DashboardCard title="Total Products" value={stats?.total_products ?? 0} icon={<Package className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" loading={loading} />
          <DashboardCard title="Active Products" value={stats?.active_products ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={loading} />
          <DashboardCard title="Pending Review" value={stats?.pending_moderation ?? 0} icon={<Clock className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" href="/admin/products" alert={(stats?.pending_moderation ?? 0) > 0} loading={loading} />
          <DashboardCard title="Total Orders" value={stats?.total_orders ?? 0} icon={<ShoppingBag className="w-5 h-5" />} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600" href="/admin/orders" loading={loading} />
          <DashboardCard title="Pending Orders" value={stats?.pending_orders ?? 0} icon={<Zap className="w-5 h-5" />} iconBg="bg-orange-50 dark:bg-orange-900/20" iconColor="text-orange-500" href="/admin/orders?status=PENDING" alert={(stats?.pending_orders ?? 0) > 0} loading={loading} />
          <DashboardCard title="Delivered" value={stats?.delivered_orders ?? 0} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={loading} />
        </div>
      </div>

      {/* Finance */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Finance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <DashboardCard title="Total Revenue" value={`$${Number(stats?.total_revenue ?? 0).toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" href="/admin/finance" loading={loading} />
          <DashboardCard title="Monthly Revenue" value={`$${Number(financeSummary?.monthly_revenue ?? 0).toFixed(2)}`} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" loading={loading} />
          <DashboardCard title="Wallet Balance" value={`$${Number(financeSummary?.total_wallet_balance ?? 0).toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" loading={loading} />
          <DashboardCard title="Pending Withdrawals" value={financeSummary?.pending_withdrawals ?? 0} icon={<Clock className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" href="/admin/finance/withdrawals" alert={(financeSummary?.pending_withdrawals ?? 0) > 0} loading={loading} />
          <DashboardCard title="Completed Payouts" value={`$${Number(financeSummary?.completed_payouts ?? 0).toFixed(2)}`} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={loading} />
        </div>
      </div>

      {/* Operations + Support */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DashboardCard title="Active Deliveries" value={stats?.active_deliveries ?? 0} icon={<Truck className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" href="/admin/orders?status=SHIPPED" loading={loading} />
        <DashboardCard title="Cancelled Orders" value={stats?.cancelled_orders ?? 0} icon={<XCircle className="w-5 h-5" />} iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-500" loading={loading} />
        <DashboardCard title="Open Complaints" value={stats?.open_complaints ?? 0} icon={<MessageSquare className="w-5 h-5" />} iconBg="bg-orange-50 dark:bg-orange-900/20" iconColor="text-orange-500" href="/admin/complaints" alert={(stats?.open_complaints ?? 0) > 0} loading={loading} />
        <DashboardCard title="Escalated" value={stats?.escalated_complaints ?? 0} icon={<AlertTriangle className="w-5 h-5" />} iconBg="bg-red-50 dark:bg-red-900/20" iconColor="text-red-600" href="/admin/complaints?status=ESCALATED" alert={(stats?.escalated_complaints ?? 0) > 0} loading={loading} />
      </div>

      {/* Revenue chart + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-slate-500" />Revenue Overview
            </h3>
            <div className="flex gap-1">
              {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors", period === p ? "bg-slate-800 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700")}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {loading ? <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /> : <RevenueChart data={revenue} />}
        </div>

        <div className="space-y-4">
          {/* Pending KYC */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-500" />Pending KYC</h3>
              <Link href="/admin/kyc" className="text-xs text-slate-600 hover:text-slate-800 font-medium">View all</Link>
            </div>
            {loading ? <div className="p-3 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
              : pendingKyc.length === 0 ? <p className="px-4 py-4 text-xs text-gray-400">No pending KYC requests</p>
              : pendingKyc.map((k: any) => (
                <div key={k.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{k.user_email || `User #${k.user}`}</p>
                    <p className="text-[10px] text-gray-400">{k.kyc_type?.replace(/_/g, " ")}</p>
                  </div>
                  <StatusBadge status={k.status} />
                </div>
              ))}
          </div>

          {/* Recent complaints */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-red-500" />New Complaints</h3>
              <Link href="/admin/complaints" className="text-xs text-slate-600 hover:text-slate-800 font-medium">View all</Link>
            </div>
            {loading ? <div className="p-3 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
              : recentComplaints.length === 0 ? <p className="px-4 py-4 text-xs text-gray-400">No new complaints</p>
              : recentComplaints.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{c.subject}</p>
                    <p className="text-[10px] text-gray-400">{c.category} · {c.submitted_by_name}</p>
                  </div>
                  <StatusBadge status={c.priority} />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "KYC Review", icon: ShieldCheck, href: "/admin/kyc", bg: "hover:bg-amber-50 dark:hover:bg-amber-900/20", ic: "text-amber-600" },
            { label: "Products", icon: Package, href: "/admin/products", bg: "hover:bg-blue-50 dark:hover:bg-blue-900/20", ic: "text-blue-600" },
            { label: "Complaints", icon: MessageSquare, href: "/admin/complaints", bg: "hover:bg-red-50 dark:hover:bg-red-900/20", ic: "text-red-500" },
            { label: "Withdrawals", icon: DollarSign, href: "/admin/finance/withdrawals", bg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20", ic: "text-emerald-600" },
            { label: "Audit Logs", icon: FileText, href: "/admin/audit-logs", bg: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20", ic: "text-indigo-600" },
            { label: "System Health", icon: Activity, href: "/admin/system", bg: "hover:bg-slate-50 dark:hover:bg-slate-900/20", ic: "text-slate-600" },
          ].map(({ label, icon: Icon, href, bg, ic }) => (
            <Link key={label} href={href} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all text-xs font-semibold text-gray-700 dark:text-gray-300", bg)}>
              <Icon className={cn("w-5 h-5", ic)} />{label}
            </Link>
          ))}
        </div>
      </div>
    </AdminPageWrapper>
  );
}

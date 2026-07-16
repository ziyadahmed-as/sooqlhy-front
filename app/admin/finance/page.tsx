"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchFinanceSummary, fetchAdminRevenueStats, type RevenuePoint } from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import { DollarSign, TrendingUp, Clock, CheckCircle, RefreshCw, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";

const BarChartComponent = dynamic(
  () => import("recharts").then((m) => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = m;
    return function Chart({ data }: { data: RevenuePoint[] }) {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={((v: number) => [`$${v.toFixed(2)}`, "Revenue"]) as any} />
            <Bar dataKey="revenue" fill="#475569" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /> }
);

export default function AdminFinancePage() {
  const [summary, setSummary] = useState<any>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.allSettled([fetchFinanceSummary(), fetchAdminRevenueStats(period)]);
      if (s.status === "fulfilled") setSummary(s.value);
      if (r.status === "fulfilled") setRevenue(r.value.data ?? []);
    } finally { setLoading(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminPageWrapper title="Finance Overview" subtitle="Platform financial health and revenue metrics."
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <DashboardCard title="Total Revenue" value={`$${Number(summary?.total_revenue ?? 0).toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" loading={loading} />
        <DashboardCard title="Daily Revenue" value={`$${Number(summary?.daily_revenue ?? 0).toFixed(2)}`} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" loading={loading} />
        <DashboardCard title="Monthly Revenue" value={`$${Number(summary?.monthly_revenue ?? 0).toFixed(2)}`} icon={<BarChart2 className="w-5 h-5" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-600" loading={loading} />
        <DashboardCard title="Pending Payouts" value={summary?.pending_withdrawals ?? 0} icon={<Clock className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" href="/admin/finance/withdrawals" alert={(summary?.pending_withdrawals ?? 0) > 0} loading={loading} />
        <DashboardCard title="Completed Payouts" value={`$${Number(summary?.completed_payouts ?? 0).toFixed(2)}`} icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" loading={loading} />
      </div>

      {/* Wallet balance highlight */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-6 text-white">
        <p className="text-sm font-medium text-slate-300 mb-1">Total Wallet Balance (All Users)</p>
        <p className="text-4xl font-black">${Number(summary?.total_wallet_balance ?? 0).toFixed(2)}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
          <span>{summary?.total_wallets ?? 0} active wallets</span>
          <span>·</span>
          <span>${Number(summary?.pending_withdrawal_amount ?? 0).toFixed(2)} pending withdrawal</span>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><BarChart2 className="w-4 h-4 text-slate-500" />Revenue Chart</h3>
          <div className="flex gap-1">
            {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors", period === p ? "bg-slate-800 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700")}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <BarChartComponent data={revenue} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/finance/withdrawals" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:border-amber-200 transition-colors">
          <Clock className="w-5 h-5 text-amber-500" />
          <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Withdrawal Approvals</p><p className="text-xs text-gray-400">{summary?.pending_withdrawals ?? 0} pending review</p></div>
        </Link>
        <Link href="/admin/finance/commissions" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 transition-colors">
          <DollarSign className="w-5 h-5 text-indigo-500" />
          <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Commission Rates</p><p className="text-xs text-gray-400">Configure marketplace commissions</p></div>
        </Link>
      </div>
    </AdminPageWrapper>
  );
}

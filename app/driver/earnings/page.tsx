"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchEarningsHistory } from "@/lib/api/driver";
import { useDriverStore } from "@/stores/driver-store";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { DollarSign, TrendingUp, Receipt, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EarningsPage() {
  const { stats, statsLoading, loadStats } = useDriverStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [txLoading, setTxLoading] = useState(true);
  const PAGE_SIZE = 20;

  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await fetchEarningsHistory({ page, page_size: PAGE_SIZE });
      setTransactions(res.results);
      setCount(res.count);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [page]);

  const refresh = useCallback(async () => {
    await Promise.allSettled([loadStats(), loadTransactions()]);
  }, [loadStats, loadTransactions]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <DriverPageWrapper
      title="Earnings"
      subtitle="Track your delivery income and transaction history."
      actions={
        <button onClick={refresh} disabled={statsLoading || txLoading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", (statsLoading || txLoading) && "animate-spin")} />
        </button>
      }
    >
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DashboardCard title="Today" value={`$${(stats?.today_earnings ?? 0).toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" loading={statsLoading} />
        <DashboardCard title="This Week" value={`$${(stats?.weekly_earnings ?? 0).toFixed(2)}`} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" loading={statsLoading} />
        <DashboardCard title="This Month" value={`$${(stats?.monthly_earnings ?? 0).toFixed(2)}`} icon={<Receipt className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" loading={statsLoading} />
        <DashboardCard title="Total Earnings" value={`$${(stats?.total_earnings ?? 0).toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-600" loading={statsLoading} />
      </div>

      {/* Wallet balance */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <p className="text-sm font-medium opacity-80 mb-1">Wallet Balance</p>
        <p className="text-4xl font-black">${(stats?.wallet_balance ?? 0).toFixed(2)}</p>
        <p className="text-xs opacity-70 mt-2">Available for withdrawal</p>
      </div>

      {/* Transaction history */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-400" />Transaction History
          </h3>
        </div>
        {txLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions yet" description="Earnings from completed deliveries appear here." icon={<DollarSign className="h-10 w-10" />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Date", "Description", "Type", "Amount"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{tx.description || "Delivery earnings"}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        tx.transaction_type === "CREDIT"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className={cn("px-4 py-3 font-bold whitespace-nowrap", tx.transaction_type === "CREDIT" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")}>
                      {tx.transaction_type === "CREDIT" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </DriverPageWrapper>
  );
}

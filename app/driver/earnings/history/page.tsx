"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchEarningsHistory } from "@/lib/api/driver";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Receipt, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EarningsHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEarningsHistory({ page, page_size: PAGE_SIZE });
      const results = Array.isArray(res) ? res : (res as any).results ?? [];
      setTransactions(results);
      setCount(typeof (res as any).count === "number" ? (res as any).count : results.length);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <DriverPageWrapper
      title="Transaction History"
      subtitle={`${count} total transactions`}
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-400" />All Transactions
          </h3>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Earnings from completed deliveries will appear here."
            icon={<Receipt className="h-10 w-10" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Date & Time", "Description", "Type", "Amount"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.map((tx: any) => {
                  const isCredit = tx.transaction_type === "CREDIT";
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {tx.description || "Delivery earnings"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
                          isCredit
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {isCredit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className={cn(
                        "px-5 py-3.5 font-bold text-base whitespace-nowrap",
                        isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                      )}>
                        {isCredit ? "+" : "−"}${Number(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
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

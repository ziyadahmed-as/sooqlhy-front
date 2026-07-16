"use client";
import { useCallback, useEffect, useState } from "react";
import {
  DollarSign, ArrowDownCircle, TrendingUp, RefreshCw,
  CreditCard, Clock, CheckCircle, XCircle, Wallet as WalletIcon,
} from "lucide-react";
import { fetchWallets, fetchTransactions, fetchWithdrawals, requestWithdrawal } from "@/lib/api/finance";
import { fetchVendorAnalytics } from "@/lib/api/analytics";
import type { Wallet, Transaction, WithdrawalRequest } from "@/lib/types";
import type { AnalyticsData } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonTable } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function VendorFinancePage() {
  const [wallets, setWallets]           = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals]   = useState<WithdrawalRequest[]>([]);
  const [analytics, setAnalytics]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [txPage, setTxPage]             = useState<"transactions" | "withdrawals">("transactions");

  // Withdrawal form
  const [amount, setAmount]     = useState("");
  const [bank, setBank]         = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, t, wr, a] = await Promise.allSettled([
        fetchWallets(),
        fetchTransactions(),
        fetchWithdrawals(),
        fetchVendorAnalytics(),
      ]);
      if (w.status === "fulfilled")  setWallets(w.value);
      if (t.status === "fulfilled")  setTransactions(t.value);
      if (wr.status === "fulfilled") setWithdrawals(wr.value);
      if (a.status === "fulfilled")  setAnalytics(a.value);
    } catch (e: any) {
      setError(e?.message || "Failed to load finance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !bank || Number(amount) <= 0) {
      toast.error("Please enter a valid amount and bank details");
      return;
    }
    setSubmitting(true);
    try {
      await requestWithdrawal({ amount, bank_details: bank });
      toast.success("Withdrawal request submitted");
      setAmount("");
      setBank("");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to submit withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);

  return (
    <VendorPageWrapper
      title="Finance"
      subtitle="Track your earnings, transactions and withdrawal requests."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}

      {/* ── Revenue KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DashboardCard title="Available Balance" value={`$${totalBalance.toFixed(2)}`} icon={<WalletIcon className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" loading={loading} />
        <DashboardCard title="Revenue Today" value={`$${Number(analytics?.revenue_today ?? 0).toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" loading={loading} />
        <DashboardCard title="This Month" value={`$${Number(analytics?.revenue_month ?? 0).toFixed(2)}`} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-violet-50 dark:bg-violet-900/20" iconColor="text-violet-600" loading={loading} />
        <DashboardCard title="This Year" value={`$${Number(analytics?.revenue_year ?? 0).toFixed(2)}`} icon={<CreditCard className="w-5 h-5" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" loading={loading} />
      </div>

      {/* ── Balance Card + Withdrawal Form ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-100">Available Balance</p>
          <p className="text-4xl font-bold mt-1">${totalBalance.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-blue-200">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {withdrawals.filter(w => w.status === "PENDING").length} pending</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4 text-blue-500" /> Request Withdrawal
          </h3>
          <form onSubmit={handleWithdraw} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Amount ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
                disabled={submitting}
                className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bank Details</label>
              <input
                type="text"
                placeholder="Account number / IBAN"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                required
                disabled={submitting}
                className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || wallets.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
            >
              {submitting ? "Processing…" : "Request Withdrawal"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Transactions / Withdrawals Toggle ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setTxPage("transactions")}
            className={cn("px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors", txPage === "transactions" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Transaction History
          </button>
          <button
            onClick={() => setTxPage("withdrawals")}
            className={cn("px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors", txPage === "withdrawals" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Withdrawal Requests
          </button>
        </div>

        {txPage === "transactions" ? (
          loading ? (
            <div className="p-4"><SkeletonTable rows={5} /></div>
          ) : transactions.length === 0 ? (
            <EmptyState title="No transactions yet" description="Your transaction history will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {["Date", "Description", "Type", "Amount"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {transactions.slice(0, 20).map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{t.description || "—"}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={t.transaction_type} /></td>
                      <td className={cn("px-5 py-3.5 text-sm font-bold", t.transaction_type === "CREDIT" ? "text-emerald-600" : "text-red-500")}>
                        {t.transaction_type === "CREDIT" ? "+" : "-"}${Number(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          loading ? (
            <div className="p-4"><SkeletonTable rows={4} /></div>
          ) : withdrawals.length === 0 ? (
            <EmptyState title="No withdrawal requests" description="Your withdrawal requests will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {["Date", "Amount", "Bank Details", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {withdrawals.map((wr) => (
                    <tr key={wr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(wr.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-gray-900 dark:text-white">${Number(wr.amount).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{wr.bank_details}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={wr.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </VendorPageWrapper>
  );
}

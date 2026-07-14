"use client";
import { useEffect, useState, useCallback } from 'react';
import { VendorGuard } from '@/components/layout/VendorGuard';
import {
  fetchWallets,
  fetchTransactions,
  fetchWithdrawals,
  requestWithdrawal,
} from '@/lib/api/finance';
import type { Wallet, Transaction, WithdrawalRequest } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonTable } from '@/components/shared/SkeletonCard';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { DollarSign, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorFinancePage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Withdrawal form
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, t, wr] = await Promise.all([
        fetchWallets(),
        fetchTransactions(),
        fetchWithdrawals(),
      ]);
      setWallets(w);
      setTransactions(t);
      setWithdrawals(wr);
    } catch (err: unknown) {
      setError((err as any)?.message || 'Failed to load finance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !bank || Number(amount) <= 0) {
      toast.error('Please enter a valid amount and bank details');
      return;
    }
    setSubmitting(true);
    try {
      await requestWithdrawal({ amount, bank_details: bank });
      toast.success('Withdrawal request submitted');
      setAmount('');
      setBank('');
      await loadData();
    } catch (err: unknown) {
      toast.error((err as any)?.response?.data?.detail || 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  return (
    <VendorGuard>
      <div className="p-6 space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6" /> Finance
          </h1>
        </div>

        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Balance Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm sm:col-span-2">
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
              ${loading ? '—' : totalBalance.toFixed(2)}
            </p>
          </div>

          {/* Withdrawal Form */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-primary-500" />
              Request Withdrawal
            </h3>
            <form onSubmit={handleWithdraw} className="space-y-3">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
                disabled={submitting}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Bank details / account number"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                required
                disabled={submitting}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={submitting || wallets.length === 0}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2 transition-colors"
              >
                {submitting ? 'Processing…' : 'Withdraw'}
              </button>
            </form>
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          </div>
          {loading ? (
            <div className="p-4"><SkeletonTable rows={5} /></div>
          ) : transactions.length === 0 ? (
            <EmptyState title="No transactions" description="Your transaction history will appear here." />
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Date', 'Description', 'Type', 'Amount'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.slice(0, 20).map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{t.description}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={t.transaction_type} />
                    </td>
                    <td className={`px-6 py-3 text-sm font-semibold ${
                      t.transaction_type === 'CREDIT' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {t.transaction_type === 'CREDIT' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Withdrawal Requests */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Withdrawal Requests</h3>
          </div>
          {loading ? (
            <div className="p-4"><SkeletonTable rows={3} /></div>
          ) : withdrawals.length === 0 ? (
            <EmptyState title="No withdrawal requests" />
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Date', 'Amount', 'Bank Details', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {withdrawals.map((wr) => (
                  <tr key={wr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {new Date(wr.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      ${Number(wr.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {wr.bank_details}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={wr.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </VendorGuard>
  );
}

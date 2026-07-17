"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchAllWithdrawals, approveWithdrawal, rejectWithdrawal, type AdminWithdrawal } from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Receipt, RefreshCw, Check, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<AdminWithdrawal | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      const res = await fetchAllWithdrawals(params);
      setWithdrawals(res.results); setCount(res.count);
    } catch { setWithdrawals([]); } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (w: AdminWithdrawal) => {
    setActionId(w.id);
    try { await approveWithdrawal(w.id); toast.success(`Withdrawal $${w.amount} approved`); load(); }
    catch (e: any) { toast.error(e?.response?.data?.error || "Failed"); } finally { setActionId(null); }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    setActionId(rejectModal.id);
    try { await rejectWithdrawal(rejectModal.id, rejectReason); toast.success("Withdrawal rejected"); setRejectModal(null); setRejectReason(""); load(); }
    catch { toast.error("Failed"); } finally { setActionId(null); }
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <AdminPageWrapper title="Withdrawal Approvals" subtitle={`${count} requests`}
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors", statusFilter === s ? "bg-slate-800 text-white border-slate-800" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-slate-400")}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          : withdrawals.length === 0 ? <EmptyState title="No withdrawal requests" description="All caught up." icon={<Receipt className="h-10 w-10" />} />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {["Vendor", "Amount", "Balance", "Bank Details", "Requested", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3"><p className="font-medium text-gray-900 dark:text-white">{w.user_name}</p><p className="text-xs text-gray-400">{w.user_email}</p></td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">${Number(w.amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">${Number(w.wallet_balance).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[180px] truncate">{w.bank_details}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                      <td className="px-4 py-3">
                        {w.status === "PENDING" && (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleApprove(w)} disabled={actionId === w.id}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 disabled:opacity-50 transition-colors">
                              <Check className="w-3 h-3" />Approve
                            </button>
                            <button onClick={() => setRejectModal(w)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors">
                              <X className="w-3 h-3" />Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reject Withdrawal — {rejectModal.user_name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Amount: ${Number(rejectModal.amount).toFixed(2)}</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Reason for rejection (optional)..."
              className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleRejectConfirm} disabled={actionId !== null}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </AdminPageWrapper>
  );
}

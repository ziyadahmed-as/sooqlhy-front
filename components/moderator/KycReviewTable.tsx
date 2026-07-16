"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchKycRecords, approveKyc, rejectKyc, fetchKycSummary } from "@/lib/api/moderator";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { ShieldCheck, RefreshCw, Check, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props { title: string; roleFilter: string; }

export default function KycReviewTable({ title, roleFilter }: Props) {
  const [records, setRecords] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [summary, setSummary] = useState<any>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; email: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params["user__role"] = roleFilter;
      const [res, sum] = await Promise.allSettled([
        fetchKycRecords(params),
        fetchKycSummary(),
      ]);
      if (res.status === "fulfilled") { setRecords(res.value.results); setCount(res.value.count); }
      if (sum.status === "fulfilled") setSummary(sum.value);
    } catch { setRecords([]); } finally { setLoading(false); }
  }, [page, statusFilter, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string, email: string) => {
    setActionId(id);
    try { await approveKyc(id); toast.success(`KYC approved for ${email}`); load(); }
    catch { toast.error("Failed to approve KYC"); } finally { setActionId(null); }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionId(rejectModal.id);
    try {
      await rejectKyc(rejectModal.id, rejectReason);
      toast.success(`KYC rejected for ${rejectModal.email}`);
      setRejectModal(null); setRejectReason("");
      load();
    } catch { toast.error("Failed to reject KYC"); } finally { setActionId(null); }
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <ModeratorPageWrapper title={title} subtitle={`${count} records`}
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pending", value: summary.total_pending, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10" },
            { label: "Approved Today", value: summary.approvals_today, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10" },
            { label: "Rejected Today", value: summary.rejections_today, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/10" },
            { label: "Avg Review Time", value: `${Math.round(summary.avg_review_time_seconds / 3600)}h`, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/10" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={cn("rounded-xl p-4 text-center", bg)}>
              <p className={cn("text-2xl font-black", color)}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", ""].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors", statusFilter === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300")}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3,4].map((i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : records.length === 0 ? (
          <EmptyState title="No KYC records" description="No records match the current filters." icon={<ShieldCheck className="h-10 w-10" />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["User", "Document Type", "Submitted", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{r.user_email || `User #${r.user}`}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.kyc_type?.replace(/_/g, " ") || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.document_file && (
                          <a href={r.document_file} target="_blank" rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors">
                            View Doc
                          </a>
                        )}
                        {(r.status === "PENDING" || r.status === "UNDER_REVIEW") && (
                          <>
                            <button onClick={() => handleApprove(r.id, r.user_email)} disabled={actionId === r.id}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 disabled:opacity-50 transition-colors">
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button onClick={() => setRejectModal({ id: r.id, email: r.user_email })}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors">
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reject KYC — {rejectModal.email}</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Enter rejection reason..."
              className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mt-2" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleRejectConfirm} disabled={!rejectReason.trim() || actionId !== null}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </ModeratorPageWrapper>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchKycRecords, approveKyc, rejectKyc, fetchKycSummary, bulkKycAction, type KycRecord } from "@/lib/api/moderator";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import KycReviewModal from "@/components/moderator/KycReviewModal";
import { ShieldCheck, RefreshCw, Filter, Eye, Check, AlertTriangle, FileQuestion, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props { title: string; roleFilter: string; }

export default function KycReviewTable({ title, roleFilter }: Props) {
  const [records, setRecords] = useState<KycRecord[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [summary, setSummary] = useState<any>(null);
  const [reviewRecord, setReviewRecord] = useState<KycRecord | null>(null);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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
      setSelectedIds(new Set()); // clear selection on load
    } catch { setRecords([]); } finally { setLoading(false); }
  }, [page, statusFilter, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // Bulk Handlers
  const pendingRecords = records.filter(r => r.status === 'PENDING' || r.status === 'UNDER_REVIEW');
  const selectableIds = pendingRecords.map(r => r.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every(id => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableIds));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkAction = async (actionType: 'approve' | 'reject' | 'request_documents') => {
    if (selectedIds.size === 0) return;

    let reason = "";
    if (actionType === 'reject') {
      const input = prompt("Enter a reason for bulk rejection:");
      if (!input) return; // cancelled
      reason = input;
    } else if (actionType === 'request_documents') {
      const input = prompt("Enter the required documents (comma separated):");
      if (!input) return; // cancelled
      reason = input;
    }

    if (!confirm(`Are you sure you want to bulk ${actionType} ${selectedIds.size} records?`)) return;

    setBulkActionLoading(true);
    try {
      await bulkKycAction(Array.from(selectedIds), actionType, reason, "Bulk action applied");
      toast.success(`Bulk ${actionType} completed for ${selectedIds.size} records.`);
      load();
    } catch {
      toast.error(`Failed to execute bulk ${actionType}.`);
    } finally {
      setBulkActionLoading(false);
    }
  };

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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "REQUESTED_DOCUMENTS", ""].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors", statusFilter === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300")}>
              {s ? s.replace(/_/g, " ") : "All"}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mr-2">
              {selectedIds.size} selected
            </span>
            <button onClick={() => handleBulkAction('approve')} disabled={bulkActionLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            <button onClick={() => handleBulkAction('reject')} disabled={bulkActionLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" /> Reject
            </button>
            <button onClick={() => handleBulkAction('request_documents')} disabled={bulkActionLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors">
              <FileQuestion className="w-3.5 h-3.5" /> Request Docs
            </button>
            {bulkActionLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />}
          </div>
        )}
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
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                      checked={allSelected}
                      disabled={selectableIds.length === 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {["User", "Role", "Document Type", "Submitted", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {records.map((r) => {
                  const isSelectable = r.status === 'PENDING' || r.status === 'UNDER_REVIEW';
                  return (
                  <tr key={r.id} className={cn("hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors", selectedIds.has(r.id) && "bg-indigo-50/50 dark:bg-indigo-900/10")}>
                    <td className="px-4 py-3">
                      {isSelectable && (
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleSelectRow(r.id)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{r.user_details?.full_name || r.user_email || `User #${r.user}`}</p>
                      <p className="text-[11px] text-gray-400">{r.user_email}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.user_role || r.user_details?.role || "—"} /></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.kyc_type?.replace(/_/g, " ") || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setReviewRecord(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Review KYC
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {/* KYC Review Modal */}
      {reviewRecord && (
        <KycReviewModal
          record={reviewRecord}
          onClose={() => setReviewRecord(null)}
          onAction={load}
        />
      )}
    </ModeratorPageWrapper>
  );
}

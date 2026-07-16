"use client";
import { Suspense } from "react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchComplaints, fetchComplaintStats, updateComplaintStatus,
  setComplaintPriority, addComplaintNote, escalateComplaint,
  requestEvidence, saveInternalNotes, type Complaint, type ComplaintStats,
} from "@/lib/api/moderator";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import {
  MessageSquare, Search, RefreshCw, Filter, ChevronDown,
  AlertTriangle, Clock, CheckCircle, XCircle, Send,
  FileText, TrendingUp, Eye, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
  MEDIUM: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  HIGH: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
  URGENT: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
};

function ComplaintDetailDrawer({ complaint, onClose, onRefresh }: {
  complaint: Complaint; onClose: () => void; onRefresh: () => void;
}) {
  const [note, setNote] = useState("");
  const [internalNote, setInternalNote] = useState(complaint.internal_notes);
  const [addingNote, setAddingNote] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [showEscalate, setShowEscalate] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateComplaintStatus(complaint.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      onRefresh();
    } catch { toast.error("Failed to update status"); }
  };

  const handlePriorityChange = async (p: string) => {
    try {
      await setComplaintPriority(complaint.id, p);
      toast.success(`Priority set to ${p}`);
      onRefresh();
    } catch { toast.error("Failed to update priority"); }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      await addComplaintNote(complaint.id, note, "MODERATOR", true);
      toast.success("Note added");
      setNote("");
      onRefresh();
    } catch { toast.error("Failed to add note"); } finally { setAddingNote(false); }
  };

  const handleSaveInternalNotes = async () => {
    setSavingNotes(true);
    try {
      await saveInternalNotes(complaint.id, internalNote);
      toast.success("Internal notes saved");
    } catch { toast.error("Failed to save notes"); } finally { setSavingNotes(false); }
  };

  const handleRequestEvidence = async () => {
    try {
      await requestEvidence(complaint.id);
      toast.success("Evidence requested from customer");
      onRefresh();
    } catch { toast.error("Failed to request evidence"); }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) { toast.error("Escalation reason required"); return; }
    try {
      await escalateComplaint(complaint.id, escalateReason);
      toast.success("Complaint escalated to administrators");
      setShowEscalate(false);
      onRefresh();
    } catch { toast.error("Failed to escalate"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Complaint #{complaint.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">{complaint.subject}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Status + Priority row */}
          <div className="flex flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</p>
              <select defaultValue={complaint.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {["NEW", "UNDER_REVIEW", "WAITING", "RESOLVED", "CLOSED", "ESCALATED"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</p>
              <div className="flex gap-1.5">
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                  <button key={p} onClick={() => handlePriorityChange(p)}
                    className={cn("px-2.5 py-1 rounded-lg text-xs font-bold transition-colors", complaint.priority === p ? PRIORITY_COLORS[p] + " ring-2 ring-current/30" : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700")}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{complaint.submitted_by_name}</p>
              <p className="text-xs text-gray-400">{complaint.submitted_by_email}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{complaint.category}</p>
              {complaint.order_number && <p className="text-xs text-gray-400">Order #{complaint.order_number}</p>}
            </div>
            {complaint.against_vendor_email && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Against Vendor</p>
                <p className="text-sm text-gray-900 dark:text-white">{complaint.against_vendor_email}</p>
              </div>
            )}
            {complaint.against_driver_email && (
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Against Driver</p>
                <p className="text-sm text-gray-900 dark:text-white">{complaint.against_driver_email}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{complaint.description}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleRequestEvidence} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <FileText className="w-3.5 h-3.5" /> Request Evidence
            </button>
            <button onClick={() => handleStatusChange("RESOLVED")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 transition-colors">
              <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
            </button>
            <button onClick={() => setShowEscalate(!showEscalate)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" /> Escalate
            </button>
          </div>

          {/* Escalate form */}
          {showEscalate && (
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-800/30 space-y-3">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Escalate to Admin</p>
              <textarea value={escalateReason} onChange={(e) => setEscalateReason(e.target.value)} rows={2} placeholder="Reason for escalation..."
                className="w-full text-sm rounded-lg border border-red-200 dark:border-red-800/50 p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
              <button onClick={handleEscalate} className="w-full py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">
                Confirm Escalation
              </button>
            </div>
          )}

          {/* Timeline */}
          {complaint.notes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Activity Timeline</p>
              <div className="space-y-3">
                {complaint.notes.map((n) => (
                  <div key={n.id} className={cn("rounded-xl p-3 text-sm", n.note_type === "SYSTEM" ? "bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700" : n.is_internal ? "bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700")}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", n.note_type === "SYSTEM" ? "text-gray-400" : "text-indigo-600 dark:text-indigo-400")}>{n.note_type}</span>
                      <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{n.content}</p>
                    {n.author_name && n.note_type !== "SYSTEM" && (
                      <p className="text-xs text-gray-400 mt-1">— {n.author_name}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add note */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Add Moderator Note</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Add an internal note..."
              className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            <button onClick={handleAddNote} disabled={!note.trim() || addingNote}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <Send className="w-3.5 h-3.5" />{addingNote ? "Adding..." : "Add Note"}
            </button>
          </div>

          {/* Internal notes */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Internal Notes (private)</p>
            <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} rows={3} placeholder="Private notes visible only to moderators..."
              className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            <button onClick={handleSaveInternalNotes} disabled={savingNotes}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 transition-colors">
              <FileText className="w-3.5 h-3.5" />{savingNotes ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModeratorComplaintsPage() {
  const sp = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(sp?.get("status") ?? "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selected, setSelected] = useState<Complaint | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const [res, st] = await Promise.allSettled([
        fetchComplaints(params),
        fetchComplaintStats(),
      ]);
      if (res.status === "fulfilled") { setComplaints(res.value.results); setCount(res.value.count); }
      if (st.status === "fulfilled") setStats(st.value);
    } catch { setComplaints([]); } finally { setLoading(false); }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <ModeratorPageWrapper title="Complaint Management" subtitle={`${count} complaints`}
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-gray-900 dark:text-white", bg: "bg-white dark:bg-gray-900" },
            { label: "New", value: stats.new, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/10" },
            { label: "Reviewing", value: stats.under_review, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/10" },
            { label: "Waiting", value: stats.waiting, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10" },
            { label: "Resolved", value: stats.resolved, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10" },
            { label: "Escalated", value: stats.escalated, color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/10" },
            { label: "Rate", value: `${stats.resolution_rate}%`, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/10" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={cn("rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center shadow-sm", bg)}>
              <p className={cn("text-xl font-black", color)}>{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search complaints..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {["", "NEW", "UNDER_REVIEW", "WAITING", "RESOLVED", "CLOSED", "ESCALATED"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn("px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap", statusFilter === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300")}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : complaints.length === 0 ? (
          <EmptyState title="No complaints found" description="No complaints match the current filters." icon={<MessageSquare className="h-10 w-10" />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["#", "Subject", "Customer", "Category", "Priority", "Status", "Date", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{c.id}</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{c.subject}</p>
                      <p className="text-xs text-gray-400 truncate">{c.description.slice(0, 60)}...</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.submitted_by_name}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{c.category}</span></td>
                    <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", PRIORITY_COLORS[c.priority] || "")}>{c.priority}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(c)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {selected && (
        <ComplaintDetailDrawer
          complaint={selected}
          onClose={() => setSelected(null)}
          onRefresh={() => { load(); }}
        />
      )}
    </ModeratorPageWrapper>
  );
}

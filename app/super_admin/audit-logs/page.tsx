"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchAuditLogs, type AuditLogEntry } from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { FileText, Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  KYC_APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  KYC_REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  WITHDRAWAL_APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  WITHDRAWAL_REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  USER_SUSPEND: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  USER_ACTIVATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  BROADCAST_NOTIFICATION: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      const res = await fetchAuditLogs(params);
      setLogs(res.results); setCount(res.count);
    } catch { setLogs([]); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <AdminPageWrapper title="Audit Logs" subtitle={`${count} recorded actions`}
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by action or description..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? <div className="p-4 space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          : logs.length === 0 ? <EmptyState title="No audit logs" description="Actions will appear here as they occur." icon={<FileText className="h-10 w-10" />} />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {["Timestamp", "Action", "Actor", "User", "Description"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400")}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">{log.actor ? `#${log.actor}` : "System"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">{log.user ? `#${log.user}` : "—"}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </AdminPageWrapper>
  );
}

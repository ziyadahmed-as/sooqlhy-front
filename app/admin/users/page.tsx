"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchUsers, suspendUser, activateUser, deleteUser, type FullAdminStats } from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Users, Search, RefreshCw, UserX, UserCheck, Trash2, Filter, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const ROLES = ["", "VENDOR", "DRIVER", "MODERATOR", "BUYER", "ADMIN"];

function UsersContent() {
  const sp = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(sp?.get("role") ?? "");
  const [activeFilter, setActiveFilter] = useState(sp?.get("is_active") ?? "");
  const [actionId, setActionId] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== "") params.is_active = activeFilter;
      const res = await fetchUsers(params);
      setUsers(res.results); setCount(res.count);
    } catch { setUsers([]); } finally { setLoading(false); }
  }, [page, search, roleFilter, activeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSuspend = async (u: User) => {
    setActionId(u.id);
    try { await suspendUser(u.id); toast.success(`${u.email} suspended`); load(); }
    catch { toast.error("Failed"); } finally { setActionId(null); }
  };

  const handleActivate = async (u: User) => {
    setActionId(u.id);
    try { await activateUser(u.id); toast.success(`${u.email} activated`); load(); }
    catch { toast.error("Failed"); } finally { setActionId(null); }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return;
    setActionId(u.id);
    try { await deleteUser(u.id); toast.success("User deleted"); load(); }
    catch { toast.error("Failed"); } finally { setActionId(null); }
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <AdminPageWrapper title="User Management" subtitle={`${count} users`}
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {ROLES.map((r) => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className={cn("px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors", roleFilter === r ? "bg-slate-800 text-white border-slate-800" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-slate-400")}>
              {r || "All"}
            </button>
          ))}
          <button onClick={() => { setActiveFilter(activeFilter === "false" ? "" : "false"); setPage(1); }}
            className={cn("px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors", activeFilter === "false" ? "bg-red-600 text-white border-red-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-400")}>
            Suspended
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          : users.length === 0 ? <EmptyState title="No users found" description="Try adjusting your filters." icon={<Users className="h-10 w-10" />} />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {["User", "Email", "Role", "Verified", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3"><p className="font-medium text-gray-900 dark:text-white">{u.full_name || u.first_name || "—"}</p><p className="text-[10px] text-gray-400">#{u.id}</p></td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{u.email}</td>
                      <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                      <td className="px-4 py-3"><span className={cn("text-xs font-semibold", u.is_verified ? "text-green-600 dark:text-green-400" : "text-gray-400")}>{u.is_verified ? "✓ Yes" : "✗ No"}</span></td>
                      <td className="px-4 py-3"><StatusBadge status={u.is_active ? "AVAILABLE" : "CANCELLED"} /></td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{new Date(u.date_joined).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {u.is_active ? (
                            <button onClick={() => handleSuspend(u)} disabled={actionId === u.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 disabled:opacity-50 transition-colors">
                              <UserX className="w-3 h-3" />Suspend
                            </button>
                          ) : (
                            <button onClick={() => handleActivate(u)} disabled={actionId === u.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 disabled:opacity-50 transition-colors">
                              <UserCheck className="w-3 h-3" />Activate
                            </button>
                          )}
                          <button onClick={() => handleDelete(u)} disabled={actionId === u.id}
                            className="p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
    </AdminPageWrapper>
  );
}

export default function AdminUsersPage() {
  return <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Loading...</div>}><UsersContent /></Suspense>;
}

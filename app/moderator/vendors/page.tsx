"use client";
import { Suspense } from "react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchModeratorVendors, suspendUser, activateUser, type ModeratorUser } from "@/lib/api/moderator";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Users, Search, RefreshCw, ShieldCheck, UserX, UserCheck, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ModeratorVendorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Loading...</div>}>
      <VendorsContent />
    </Suspense>
  );
}

function VendorsContent() {
  const sp = useSearchParams();
  const [vendors, setVendors] = useState<ModeratorUser[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState(sp?.get("is_active") === "false" ? "false" : "");
  const [actionId, setActionId] = useState<number | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (verifiedFilter !== "") params.is_active = verifiedFilter;
      const res = await fetchModeratorVendors(params);
      setVendors(res.results); setCount(res.count);
    } catch { setVendors([]); } finally { setLoading(false); }
  }, [page, search, verifiedFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSuspend = async (v: ModeratorUser) => {
    setActionId(v.id);
    try {
      await suspendUser(v.id, "vendors");
      toast.success(`${v.email} suspended`);
      load();
    } catch { toast.error("Failed to suspend vendor"); } finally { setActionId(null); }
  };

  const handleActivate = async (v: ModeratorUser) => {
    setActionId(v.id);
    try {
      await activateUser(v.id, "vendors");
      toast.success(`${v.email} activated`);
      load();
    } catch { toast.error("Failed to activate vendor"); } finally { setActionId(null); }
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <ModeratorPageWrapper title="Vendor Management" subtitle={`${count} vendors`}
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {[{ label: "All", value: "" }, { label: "Verified", value: "true" }, { label: "Unverified", value: "false" }].map(({ label, value }) => (
            <button key={value} onClick={() => { setVerifiedFilter(value === verifiedFilter ? "" : value); setPage(1); }}
              className={cn("px-3 py-2 rounded-lg text-xs font-semibold border transition-colors", verifiedFilter === value ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : vendors.length === 0 ? (
          <EmptyState title="No vendors found" description="Try adjusting your filters." icon={<Users className="h-10 w-10" />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Vendor", "Store", "KYC", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{v.full_name || v.email}</p>
                      <p className="text-xs text-gray-400">{v.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{v.vendor_profile?.store_name || v.vendor_profile?.business_name || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.is_verified ? "APPROVED" : "PENDING"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.is_active ? "AVAILABLE" : "CANCELLED"} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {new Date(v.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {v.is_active ? (
                          <button onClick={() => handleSuspend(v)} disabled={actionId === v.id}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 disabled:opacity-50 transition-colors">
                            <UserX className="w-3.5 h-3.5" /> Suspend
                          </button>
                        ) : (
                          <button onClick={() => handleActivate(v)} disabled={actionId === v.id}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 disabled:opacity-50 transition-colors">
                            <UserCheck className="w-3.5 h-3.5" /> Activate
                          </button>
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
    </ModeratorPageWrapper>
  );
}

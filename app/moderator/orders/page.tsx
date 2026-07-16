"use client";
import { Suspense } from "react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchModeratorOrders } from "@/lib/api/moderator";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { ShoppingBag, Search, RefreshCw, MapPin, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "COMPLETED"];

export default function ModeratorOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const sp = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(sp?.get("status") ?? "");
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await fetchModeratorOrders(params);
      setOrders(res.results); setCount(res.count);
    } catch { setOrders([]); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <ModeratorPageWrapper title="Order Monitoring" subtitle={`${count} orders`}
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search order ID, tracking..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn("px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors", statusFilter === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300")}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3,4,5,6].map((i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState title="No orders found" description="Try adjusting your filters." icon={<ShoppingBag className="h-10 w-10" />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Order", "Customer", "Vendor", "Driver", "Address", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{o.buyer_name || `#${o.buyer}`}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{o.vendor || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{o.driver_name || (o.driver ? `#${o.driver}` : "—")}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[150px]">
                      {o.shipping_address ? (
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{o.shipping_address.city ?? "—"}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">${Number(o.total_amount ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
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

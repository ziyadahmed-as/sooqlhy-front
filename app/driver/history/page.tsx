"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchDeliveryHistory, type DriverOrder } from "@/lib/api/driver";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { History, MapPin, Search, Star, RefreshCw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
];

export default function DeliveryHistoryPage() {
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const PAGE_SIZE = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await fetchDeliveryHistory(params);
      setOrders(res.results);
      setCount(res.count);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <DriverPageWrapper
      title="Delivery History"
      subtitle={`${count} total deliveries`}
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or tracking number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setStatusFilter(value); setPage(1); }}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-semibold border transition-colors",
                statusFilter === value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState title="No deliveries found" description="Try adjusting your filters." icon={<History className="h-10 w-10" />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Order", "Customer", "Address", "Date", "Rating", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">#{order.id}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{order.buyer_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[180px]">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{order.shipping_address?.city ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {order.delivery_rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.delivery_rating.rating}</span>
                        </div>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </DriverPageWrapper>
  );
}

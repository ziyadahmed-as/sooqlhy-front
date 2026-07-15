"use client";
import { useCallback, useEffect, useState } from "react";
import { Users, RefreshCw, Search, X } from "lucide-react";
import api from "@/lib/api/axios";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { VendorTable, type Column } from "@/components/vendor/VendorTable";
import { cn } from "@/lib/utils";

interface CustomerRow {
  id: string;
  buyer_name: string;
  order_count: number;
  total_spent: number;
  last_order: string;
  status: string;
}

export default function VendorCustomersPage() {
  const [customers, setCustomers]   = useState<CustomerRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Derive customer list from vendor orders
      const { data } = await api.get("/api/orders/vendor-orders/", { params: { page_size: 200 } });
      const orders = Array.isArray(data) ? data : data.results ?? [];
      const map: Record<string, CustomerRow> = {};
      for (const o of orders) {
        const key = String(o.buyer ?? o.buyer_id ?? "unknown");
        const name = o.buyer_name || o.buyerName || "Customer";
        if (!map[key]) {
          map[key] = { id: key, buyer_name: name, order_count: 0, total_spent: 0, last_order: o.created_at, status: o.status };
        }
        map[key].order_count += 1;
        map[key].total_spent += Number(o.total_amount ?? 0);
        if (o.created_at > map[key].last_order) map[key].last_order = o.created_at;
      }
      setCustomers(Object.values(map).sort((a, b) => b.total_spent - a.total_spent));
    } catch (e: any) {
      setError(e?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    return c.buyer_name.toLowerCase().includes(search.toLowerCase());
  });

  const columns: Column<CustomerRow>[] = [
    {
      key: "customer",
      label: "Customer",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {c.buyer_name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{c.buyer_name}</span>
        </div>
      ),
    },
    {
      key: "orders",
      label: "Orders",
      render: (c) => <span className="font-semibold">{c.order_count}</span>,
    },
    {
      key: "spent",
      label: "Total Spent",
      render: (c) => <span className="font-bold text-emerald-600">${c.total_spent.toFixed(2)}</span>,
    },
    {
      key: "last",
      label: "Last Order",
      render: (c) => <span className="text-gray-500">{c.last_order ? new Date(c.last_order).toLocaleDateString() : "—"}</span>,
    },
  ];

  return (
    <VendorPageWrapper
      title="Customers"
      subtitle="View customers who have ordered from your store."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
          placeholder="Search customers…"
          className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchInput && (
          <button onClick={() => { setSearchInput(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <VendorTable
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={load}
        rowKey={(c) => c.id}
        emptyTitle="No customers yet"
        emptyDescription="Customers who order from your store will appear here."
      />
    </VendorPageWrapper>
  );
}

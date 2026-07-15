"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag, Search, RefreshCw, Truck, X, Filter,
} from "lucide-react";
import { fetchVendorOrders, updateOrderStatus } from "@/lib/api/orders";
import { usePaginatedApi } from "@/lib/hooks/usePaginatedApi";
import type { VendorOrder } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { VendorTable, type Column } from "@/components/vendor/VendorTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ORDER_STATUSES = [
  { label: "All",       value: "" },
  { label: "New",       value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped",   value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const NEXT_STATUS: Record<string, string[]> = {
  PENDING:    ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED",    "CANCELLED"],
  SHIPPED:    ["DELIVERED"],
  DELIVERED:  [],
  CANCELLED:  [],
  COMPLETED:  [],
};

export default function VendorOrdersPage() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
  const [search, setSearch]             = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  const { data: orders, loading, error, page, totalPages, setPage, refetch } =
    usePaginatedApi<VendorOrder>(
      (p) => fetchVendorOrders({ page: p, status: statusFilter, search }),
      12,
      [statusFilter, search]
    );

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      toast.success("Order status updated");
      refetch();
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<VendorOrder>[] = [
    {
      key: "order",
      label: "Order",
      render: (o) => (
        <div>
          <p className="font-mono font-semibold text-gray-900 dark:text-white text-xs">
            #{(o as any).order_number || String(o.id).slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
          </p>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (o) => (
        <p className="font-medium">
          {(o as any).buyer_name || (o as any).buyerName || "Customer"}
        </p>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (o) => (
        <span className="text-gray-500">
          {o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (o) => (
        <span className="font-bold text-gray-900 dark:text-white">
          ${Number((o as any).total_amount ?? (o as any).total ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "driver",
      label: "Driver",
      render: (o) => (
        <span className="text-gray-500 text-xs">
          {(o as any).driver_name || <span className="text-gray-300">—</span>}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "actions",
      label: "Action",
      render: (o) => {
        const nextStatuses = NEXT_STATUS[o.status] ?? [];
        return (
          <div className="flex items-center gap-2">
            {nextStatuses.length > 0 && (
              <select
                value=""
                onChange={(e) => e.target.value && handleStatusChange(o.id, e.target.value)}
                disabled={updatingId === o.id}
                className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 cursor-pointer"
              >
                <option value="">Move to…</option>
                {nextStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
            <Link
              href={`/vendor/delivery/assign?order=${o.id}`}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Assign</span>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <VendorPageWrapper
      title="Orders"
      subtitle="Manage and track all customer orders for your store."
      actions={
        <button onClick={refetch} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {/* Status Tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {ORDER_STATUSES.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={cn(
              "flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              statusFilter === tab.value
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            placeholder="Search orders…"
            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <VendorTable
        columns={columns}
        rows={orders}
        loading={loading}
        error={error}
        onRetry={refetch}
        rowKey={(o) => o.id}
        emptyTitle="No orders found"
        emptyDescription={statusFilter ? `No ${statusFilter.toLowerCase()} orders yet.` : "Orders from customers will appear here."}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </VendorPageWrapper>
  );
}

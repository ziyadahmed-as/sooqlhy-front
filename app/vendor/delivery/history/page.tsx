"use client";
import { useCallback } from "react";
import { History, RefreshCw } from "lucide-react";
import { fetchDeliveryHistory } from "@/lib/api/delivery";
import { usePaginatedApi } from "@/lib/hooks/usePaginatedApi";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { VendorTable, type Column } from "@/components/vendor/VendorTable";
import { cn } from "@/lib/utils";

export default function DeliveryHistoryPage() {
  const { data, loading, error, page, totalPages, setPage, refetch } =
    usePaginatedApi<any>((p) => fetchDeliveryHistory({ page: p }) as any, 12, []);

  const columns: Column<any>[] = [
    {
      key: "order",
      label: "Order #",
      render: (o) => (
        <span className="font-mono font-semibold text-xs text-gray-900 dark:text-white">
          #{o.order_number || String(o.id).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (o) => <span>{o.buyer_name || "Customer"}</span>,
    },
    {
      key: "driver",
      label: "Driver",
      render: (o) => <span>{o.driver_name || "—"}</span>,
    },
    {
      key: "total",
      label: "Total",
      render: (o) => <span className="font-semibold">${Number(o.total_amount ?? 0).toFixed(2)}</span>,
    },
    {
      key: "delivered",
      label: "Delivered At",
      render: (o) => <span>{o.delivered_at ? new Date(o.delivered_at).toLocaleDateString() : "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (o) => <StatusBadge status={o.status} />,
    },
  ];

  return (
    <VendorPageWrapper
      title="Delivery History"
      subtitle="All completed deliveries for your store."
      actions={
        <button onClick={refetch} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      <VendorTable
        columns={columns}
        rows={data}
        loading={loading}
        error={error}
        onRetry={refetch}
        rowKey={(o) => o.id}
        emptyTitle="No delivery history"
        emptyDescription="Completed deliveries will appear here."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </VendorPageWrapper>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { Truck, RefreshCw, MapPin, Phone, User } from "lucide-react";
import { fetchActiveDeliveries } from "@/lib/api/delivery";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

export default function ActiveDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchActiveDeliveries();
      setDeliveries(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <VendorPageWrapper
      title="Active Deliveries"
      subtitle="Track all orders currently out for delivery."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : deliveries.length === 0 ? (
        <EmptyState title="No active deliveries" description="Orders currently being shipped will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveries.map((o: any) => (
            <div key={o.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                    #{o.order_number || String(o.id).slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{o.buyer_name || "Customer"}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              {o.driver_name && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                  <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">{o.driver_name}</span>
                </div>
              )}

              {o.tracking_number && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono">{o.tracking_number}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>${Number(o.total_amount ?? 0).toFixed(2)}</span>
                <span>{o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </VendorPageWrapper>
  );
}

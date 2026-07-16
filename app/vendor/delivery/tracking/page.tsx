"use client";
import { useCallback, useEffect, useState } from "react";
import { MapPin, RefreshCw, Navigation, Clock } from "lucide-react";
import api from "@/lib/api/axios";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

export default function DeliveryTrackingPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/orders/vendor-orders/", {
        params: { status: "SHIPPED", page_size: 50 },
      });
      setOrders(Array.isArray(data) ? data : data.results ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <VendorPageWrapper
      title="Delivery Tracking"
      subtitle="Real-time tracking for orders currently in transit."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders in transit" description="Orders currently being shipped will show tracking details here." />
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                    #{o.order_number || String(o.id).slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{o.buyer_name || "Customer"}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              {o.tracking_history && o.tracking_history.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tracking Timeline</p>
                  <div className="relative pl-4 space-y-2 border-l-2 border-blue-100 dark:border-blue-900/40">
                    {o.tracking_history.map((t: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[1.125rem] w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" />
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{t.status}</p>
                          {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(t.timestamp).toLocaleString()}
                          </p>
                          {(t.location_lat && t.location_long) && (
                            <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {Number(t.location_lat).toFixed(4)}, {Number(t.location_long).toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                {o.driver_name && (
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-blue-500" />
                    Driver: <span className="font-medium text-gray-700 dark:text-gray-300">{o.driver_name}</span>
                  </span>
                )}
                {o.tracking_number && (
                  <span className="font-mono">Tracking: {o.tracking_number}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </VendorPageWrapper>
  );
}

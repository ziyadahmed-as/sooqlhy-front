"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Truck, Search, RefreshCw, CheckCircle, User, Phone,
  Car, MapPin, X, AlertTriangle,
} from "lucide-react";
import { fetchVendorOrders } from "@/lib/api/orders";
import { fetchAvailableDrivers, assignDriver, type AvailableDriver } from "@/lib/api/delivery";
import type { VendorOrder } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AssignDriverPage() {
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get("order");

  const [orders, setOrders]         = useState<VendorOrder[]>([]);
  const [drivers, setDrivers]       = useState<AvailableDriver[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<AvailableDriver | null>(null);
  const [loading, setLoading]       = useState(true);
  const [assigning, setAssigning]   = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [orderSearch, setOrderSearch]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ord, drv] = await Promise.allSettled([
        fetchVendorOrders({ status: "PENDING", page_size: 50 }),
        fetchAvailableDrivers(),
      ]);
      if (ord.status === "fulfilled") {
        const list = ord.value.results ?? [];
        setOrders(list);
        if (preselectedOrderId) {
          const pre = list.find((o) => String(o.id) === preselectedOrderId);
          if (pre) setSelectedOrder(pre);
        }
      }
      if (drv.status === "fulfilled") setDrivers(drv.value);
    } finally {
      setLoading(false);
    }
  }, [preselectedOrderId]);

  useEffect(() => { load(); }, [load]);

  const handleAssign = async () => {
    if (!selectedOrder || !selectedDriver) {
      toast.error("Please select both an order and a driver.");
      return;
    }
    setAssigning(true);
    try {
      await assignDriver(selectedOrder.id, { driver_id: selectedDriver.id });
      toast.success(`Driver ${selectedDriver.name} assigned to order #${selectedOrder.id}`);
      setSelectedOrder(null);
      setSelectedDriver(null);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to assign driver");
    } finally {
      setAssigning(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderSearch) return true;
    const q = orderSearch.toLowerCase();
    return (
      String(o.id).includes(q) ||
      ((o as any).buyer_name || "").toLowerCase().includes(q)
    );
  });

  const filteredDrivers = drivers.filter((d) => {
    if (!driverSearch) return true;
    const q = driverSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.vehicle_type.toLowerCase().includes(q) ||
      (d.phone || "").includes(q)
    );
  });

  return (
    <VendorPageWrapper
      title="Assign Driver"
      subtitle="Select a pending order and assign a verified available driver."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {/* Assignment Summary Bar */}
      {(selectedOrder || selectedDriver) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">Order:</span>
              {selectedOrder ? (
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  #{String(selectedOrder.id).slice(0, 8).toUpperCase()}
                </span>
              ) : (
                <span className="text-gray-400 italic">Not selected</span>
              )}
              {selectedOrder && (
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-gray-300 dark:text-gray-600">→</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">Driver:</span>
              {selectedDriver ? (
                <span className="font-semibold text-gray-900 dark:text-white">{selectedDriver.name}</span>
              ) : (
                <span className="text-gray-400 italic">Not selected</span>
              )}
              {selectedDriver && (
                <button onClick={() => setSelectedDriver(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleAssign}
            disabled={!selectedOrder || !selectedDriver || assigning}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {assigning ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Assigning…</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Confirm Assignment</>
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Orders Panel ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Pending Orders ({filteredOrders.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order # or customer…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
              </div>
            ) : filteredOrders.length === 0 ? (
              <EmptyState title="No pending orders" description="There are no pending orders to assign drivers to." />
            ) : (
              filteredOrders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                const hasDriver = !!(o as any).driver;
                return (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrder(isSelected ? null : o)}
                    disabled={hasDriver}
                    className={cn(
                      "w-full text-left px-5 py-3.5 transition-colors flex items-start justify-between gap-3",
                      isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/40",
                      hasDriver && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                        #{(o as any).order_number || String(o.id).slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(o as any).buyer_name || (o as any).buyerName || "Customer"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ${Number((o as any).total_amount ?? (o as any).total ?? 0).toFixed(2)} · {o.items?.length ?? 0} items
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasDriver ? (
                        <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full font-medium">Assigned</span>
                      ) : (
                        <StatusBadge status={o.status} />
                      )}
                      {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Drivers Panel ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Available Drivers ({filteredDrivers.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                placeholder="Search by name, vehicle…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="py-10 text-center px-4">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No available drivers</p>
                <p className="text-xs text-gray-400 mt-1">Verified drivers with AVAILABLE status will appear here.</p>
              </div>
            ) : (
              filteredDrivers.map((d) => {
                const isSelected = selectedDriver?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDriver(isSelected ? null : d)}
                    className={cn(
                      "w-full text-left px-5 py-3.5 transition-colors",
                      isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{d.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {d.vehicle_type}</span>
                            {d.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {d.phone}</span>}
                          </div>
                          {d.license_number && (
                            <p className="text-xs text-gray-400 mt-0.5">License: {d.license_number}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                          {d.status}
                        </span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </VendorPageWrapper>
  );
}

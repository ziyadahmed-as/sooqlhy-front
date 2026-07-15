"use client";
import { useCallback, useEffect, useState } from "react";
import { Map, RefreshCw, Globe, Building2 } from "lucide-react";
import { fetchDeliveryZones, type DeliveryZone } from "@/lib/api/delivery";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

export default function DeliveryZonesPage() {
  const [zones, setZones]   = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDeliveryZones();
      setZones(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group zones by country
  const grouped = zones.reduce<Record<string, DeliveryZone[]>>((acc, z) => {
    if (!acc[z.country]) acc[z.country] = [];
    acc[z.country].push(z);
    return acc;
  }, {});

  return (
    <VendorPageWrapper
      title="Delivery Zones"
      subtitle="Geographic areas where deliveries can be made. Drivers are assigned to these zones."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : zones.length === 0 ? (
        <EmptyState title="No delivery zones configured" description="Contact your administrator to set up delivery zones." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([country, czones]) => (
            <div key={country}>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">{country}</h3>
                <span className="text-xs text-gray-400">({czones.length} zones)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {czones.map((z) => (
                  <div key={z.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <Map className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", z.is_active ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-gray-500 bg-gray-100 dark:bg-gray-800")}>
                        {z.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{z.name}</p>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                      {z.city && <div className="flex items-center gap-1"><Building2 className="w-3 h-3" />{z.city}</div>}
                      {z.district && <div className="text-gray-400">{z.district}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </VendorPageWrapper>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { Users, RefreshCw, Search, Car, Phone, Shield, X } from "lucide-react";
import { fetchAvailableDrivers, type AvailableDriver } from "@/lib/api/delivery";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  BUSY:      "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  OFFLINE:   "text-gray-500 bg-gray-100 dark:bg-gray-800",
  RESTING:   "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
};

export default function AvailableDriversPage() {
  const [drivers, setDrivers]   = useState<AvailableDriver[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAvailableDrivers();
      setDrivers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = drivers.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.vehicle_type.toLowerCase().includes(q) ||
      (d.phone || "").includes(q)
    );
  });

  return (
    <VendorPageWrapper
      title="Available Drivers"
      subtitle="Verified drivers available for delivery assignments."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
          placeholder="Search drivers…"
          className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchInput && (
          <button onClick={() => { setSearchInput(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span><span className="font-bold text-gray-900 dark:text-white">{drivers.length}</span> total drivers</span>
        <span><span className="font-bold text-emerald-600">{drivers.filter(d => d.status === "AVAILABLE").length}</span> available</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No drivers found" description="No verified available drivers match your search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.email}</p>
                  </div>
                </div>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", STATUS_COLORS[d.status] ?? "bg-gray-100 text-gray-500")}>
                  {d.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2"><Car className="w-3.5 h-3.5 text-gray-400" />{d.vehicle_type}</div>
                {d.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" />{d.phone}</div>}
                <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-emerald-500" />KYC Verified</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </VendorPageWrapper>
  );
}

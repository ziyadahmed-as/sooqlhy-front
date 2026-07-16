"use client";
import { useEffect } from "react";
import { useModeratorStore } from "@/stores/moderator-store";
import { ModeratorPageWrapper } from "@/components/moderator/ModeratorPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { MapPin, RefreshCw, Globe, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModeratorZonesPage() {
  const { zones, zonesLoading, loadZones } = useModeratorStore();

  useEffect(() => { loadZones(); }, [loadZones]);

  return (
    <ModeratorPageWrapper title="My Zones" subtitle="Your assigned service areas and coverage."
      actions={<button onClick={loadZones} disabled={zonesLoading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", zonesLoading && "animate-spin")} /></button>}>

      {zonesLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map((i) => <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : zones.length === 0 ? (
        <div className="max-w-md mx-auto">
          <EmptyState title="No zones assigned" description="An administrator needs to assign you to one or more zones. Contact your admin to get zone access." icon={<MapPin className="h-12 w-12" />} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((z) => (
            <div key={z.id} className={cn("bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-5 space-y-3", z.is_active ? "border-gray-200 dark:border-gray-800" : "border-gray-100 dark:border-gray-900 opacity-60")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{z.zone_name}</p>
                    <p className="text-xs text-gray-400">{z.zone_city}</p>
                  </div>
                </div>
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", z.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>
                  {z.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{z.zone_country}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{z.zone_city || "—"}</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Assigned {new Date(z.assigned_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </ModeratorPageWrapper>
  );
}

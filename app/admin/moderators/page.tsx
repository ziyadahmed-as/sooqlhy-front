"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchUsers, fetchZoneAssignments, assignModeratorToZone, removeModeratorZone, fetchDeliveryZones } from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { Globe, RefreshCw, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

export default function AdminModeratorsPage() {
  const [moderators, setModerators] = useState<User[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);
  const [selectedZone, setSelectedZone] = useState<number | "">("");
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, z, a] = await Promise.allSettled([
        fetchUsers({ role: "MODERATOR", page_size: 100 }),
        fetchDeliveryZones(),
        fetchZoneAssignments({ page_size: 200 }),
      ]);
      if (m.status === "fulfilled") setModerators(m.value.results);
      if (z.status === "fulfilled") setZones(z.value);
      if (a.status === "fulfilled") setAssignments(a.value.results);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAssign = async () => {
    if (!selected || !selectedZone) return;
    setAssigning(true);
    try {
      await assignModeratorToZone(Number(selected.id), Number(selectedZone));
      toast.success("Zone assigned");
      setSelectedZone("");
      await load();
    } catch { toast.error("Failed to assign zone"); } finally { setAssigning(false); }
  };

  const handleRemove = async (assignmentId: number) => {
    if (!confirm("Remove this zone assignment?")) return;
    try { await removeModeratorZone(assignmentId); toast.success("Zone removed"); await load(); }
    catch { toast.error("Failed"); }
  };

  const getModeratorZones = (modId: string) =>
    assignments.filter((a) => String(a.moderator) === String(modId) || String(a.moderator_email) === (moderators.find((m) => m.id === modId) as any)?.email);

  return (
    <AdminPageWrapper title="Moderator Zone Management" subtitle="Assign and manage moderator geographic zones."
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Moderator list */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Moderators ({moderators.length})</h3></div>
          {loading ? <div className="p-3 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
            : moderators.length === 0 ? <EmptyState title="No moderators" description="Create moderator accounts first." icon={<Globe className="h-8 w-8" />} />
            : <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {moderators.map((m: any) => (
                  <button key={m.id} onClick={() => setSelected(m === selected ? null : m)}
                    className={cn("w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors", selected?.id === m.id && "bg-slate-50 dark:bg-slate-800/20")}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(m.full_name || m.email || "M").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.full_name || m.email}</p>
                      <p className="text-[10px] text-gray-400">{getModeratorZones(m.id).length} zone(s)</p>
                    </div>
                  </button>
                ))}
              </div>}
        </div>

        {/* Zone assignments for selected moderator */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Assign Zone to: <span className="text-indigo-600 dark:text-indigo-400">{(selected as any).full_name || selected.email}</span>
                </h3>
                <div className="flex gap-3">
                  <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value ? Number(e.target.value) : "")}
                    className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500">
                    <option value="">Select a zone...</option>
                    {zones.map((z) => <option key={z.id} value={z.id}>{z.name} ({z.city || z.country})</option>)}
                  </select>
                  <button onClick={handleAssign} disabled={!selectedZone || assigning}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 disabled:opacity-50 transition-colors">
                    <Plus className="w-4 h-4" />{assigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Assigned Zones</h3></div>
                {getModeratorZones(selected.id).length === 0 ? (
                  <div className="py-8 text-center"><MapPin className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" /><p className="text-sm text-gray-400">No zones assigned yet</p></div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {getModeratorZones(selected.id).map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-indigo-400" />
                          <div><p className="text-sm font-medium text-gray-900 dark:text-white">{a.zone_name}</p><p className="text-xs text-gray-400">{a.zone_city}, {a.zone_country}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", a.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-500")}>{a.is_active ? "Active" : "Inactive"}</span>
                          <button onClick={() => handleRemove(a.id)} className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-10 flex flex-col items-center justify-center text-center">
              <Globe className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Select a moderator to manage zone assignments</p>
            </div>
          )}
        </div>
      </div>
    </AdminPageWrapper>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import {
  fetchDeliveryZones, createDeliveryZone, updateDeliveryZone, deleteDeliveryZone,
} from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { Map, Plus, Pencil, Trash2, RefreshCw, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ZoneRow({ zone, onSave, onDelete }: { zone: any; onSave: (z: any) => Promise<void>; onDelete: (id: number) => Promise<void>; }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: zone.name, country: zone.country, region: zone.region, city: zone.city, district: zone.district, is_active: zone.is_active });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave({ ...zone, ...form }); setEditing(false); }
    finally { setSaving(false); }
  };

  if (editing) return (
    <tr className="bg-slate-50 dark:bg-slate-800/20">
      {["name", "country", "city", "district"].map((f) => (
        <td key={f} className="px-3 py-2">
          <input value={(form as any)[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
            className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-500" />
        </td>
      ))}
      <td className="px-3 py-2"><button onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))} className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors", form.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>{form.is_active ? "Active" : "Inactive"}</button></td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <button onClick={handleSave} disabled={saving} className="p-1 rounded text-green-600 hover:bg-green-50 disabled:opacity-50 transition-colors"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditing(false)} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{zone.name}</td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{zone.country}</td>
      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{zone.city || "—"}</td>
      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{zone.district || "—"}</td>
      <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", zone.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>{zone.is_active ? "Active" : "Inactive"}</span></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setEditing(true)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(zone.id)} className="p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", country: "", region: "", city: "", district: "", is_active: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { setLoading(true); try { setZones(await fetchDeliveryZones()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (z: any) => {
    try { await updateDeliveryZone(z.id, z); toast.success("Zone updated"); await load(); }
    catch { toast.error("Failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this delivery zone?")) return;
    try { await deleteDeliveryZone(id); toast.success("Deleted"); await load(); }
    catch { toast.error("Failed"); }
  };

  const handleCreate = async () => {
    if (!newForm.name || !newForm.country) { toast.error("Name and country required"); return; }
    setSaving(true);
    try { await createDeliveryZone(newForm); toast.success("Zone created"); setShowNew(false); setNewForm({ name: "", country: "", region: "", city: "", district: "", is_active: true }); await load(); }
    catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  return (
    <AdminPageWrapper title="Delivery Zones" subtitle="Manage geographic service areas."
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-colors"><Plus className="w-4 h-4" />Add Zone</button>
          <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>
        </div>
      }>

      {showNew && (
        <div className="bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-700 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          {[["name", "Zone Name *"], ["country", "Country *"], ["region", "Region"], ["city", "City"], ["district", "District"]].map(([f, label]) => (
            <div key={f}>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
              <input value={(newForm as any)[f]} onChange={(e) => setNewForm((p) => ({ ...p, [f]: e.target.value }))} placeholder={label.replace(" *", "")}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"><Check className="w-3.5 h-3.5" />Create</button>
            <button onClick={() => setShowNew(false)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
          : zones.length === 0 ? <EmptyState title="No delivery zones" description="Add zones to enable delivery operations." icon={<Map className="h-10 w-10" />} />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">{["Name", "Country", "City", "District", "Status", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">{zones.map((z) => <ZoneRow key={z.id} zone={z} onSave={handleSave} onDelete={handleDelete} />)}</tbody>
              </table>
            </div>
          )}
      </div>
    </AdminPageWrapper>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchCommissionRates, createCommissionRate, updateCommissionRate, deleteCommissionRate, type CommissionRate } from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { DollarSign, RefreshCw, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function RateRow({ rate, onSave, onDelete }: { rate: CommissionRate; onSave: (r: CommissionRate) => Promise<void>; onDelete: (id: number) => Promise<void>; }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(rate.name);
  const [pct, setPct] = useState(rate.percentage);
  const [active, setActive] = useState(rate.is_active);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave({ ...rate, name, percentage: pct, is_active: active }); setEditing(false); }
    finally { setSaving(false); }
  };

  if (editing) return (
    <tr className="bg-slate-50 dark:bg-slate-800/20">
      <td className="px-4 py-3"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" /></td>
      <td className="px-4 py-3"><input type="number" min="0" max="100" step="0.01" value={pct} onChange={(e) => setPct(e.target.value)} className="w-24 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" /></td>
      <td className="px-4 py-3"><button onClick={() => setActive(!active)} className={cn("px-3 py-1 rounded-full text-xs font-bold transition-colors", active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>{active ? "Active" : "Inactive"}</button></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"><Check className="w-3 h-3" />Save</button>
          <button onClick={() => setEditing(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{rate.name}</td>
      <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">{Number(rate.percentage).toFixed(2)}%</td>
      <td className="px-4 py-3"><span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold", rate.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>{rate.is_active ? "Active" : "Inactive"}</span></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setEditing(true)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(rate.id)} className="p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCommissionsPage() {
  const [rates, setRates] = useState<CommissionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPct, setNewPct] = useState("5.00");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { setLoading(true); try { setRates(await fetchCommissionRates()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (r: CommissionRate) => {
    try { await updateCommissionRate(r.id, r); toast.success("Rate updated"); await load(); }
    catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this commission rate?")) return;
    try { await deleteCommissionRate(id); toast.success("Deleted"); await load(); }
    catch { toast.error("Failed"); }
  };

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try { await createCommissionRate({ name: newName, percentage: newPct, is_active: true }); toast.success("Rate created"); setShowNew(false); setNewName(""); setNewPct("5.00"); await load(); }
    catch { toast.error("Failed to create"); } finally { setSaving(false); }
  };

  return (
    <AdminPageWrapper title="Commission Rates" subtitle="Configure marketplace commission percentages."
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-colors"><Plus className="w-4 h-4" />Add Rate</button>
          <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>
        </div>
      }>

      {showNew && (
        <div className="bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Standard Rate" className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div className="w-32">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Percentage (%)</label>
            <input type="number" min="0" max="100" step="0.01" value={newPct} onChange={(e) => setNewPct(e.target.value)} className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"><Check className="w-4 h-4" />Create</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          : rates.length === 0 ? <EmptyState title="No commission rates" description="Add a rate to get started." icon={<DollarSign className="h-10 w-10" />} />
          : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Name", "Percentage", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {rates.map((r) => <RateRow key={r.id} rate={r} onSave={handleSave} onDelete={handleDelete} />)}
              </tbody>
            </table>
          )}
      </div>
    </AdminPageWrapper>
  );
}

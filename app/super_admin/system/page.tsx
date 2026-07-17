"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchSystemHealth, auditKyc, syncInventory } from "@/lib/api/admin";
import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper";
import { Activity, Database, RefreshCw, CheckCircle, AlertTriangle, Play } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminSystemPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setHealth(await fetchSystemHealth()); }
    catch { setHealth(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runJob = async (name: string, fn: () => Promise<any>) => {
    setRunning(name);
    try { const res = await fn(); toast.success(res?.message || `${name} completed`); }
    catch { toast.error(`${name} failed`); } finally { setRunning(null); }
  };

  const isHealthy = health?.status === "operational";

  return (
    <AdminPageWrapper title="System Health" subtitle="Platform status and maintenance utilities."
      actions={<button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"><RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /></button>}>

      {/* Status banner */}
      <div className={cn("rounded-xl p-5 flex items-center gap-4", isHealthy ? "bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30" : "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30")}>
        {loading ? <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          : isHealthy ? <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
          : <AlertTriangle className="w-10 h-10 text-red-500 flex-shrink-0" />}
        <div>
          <p className={cn("text-lg font-bold", isHealthy ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300")}>
            {loading ? "Checking..." : isHealthy ? "All Systems Operational" : "System Degraded"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Database: {health?.database || "—"}
          </p>
        </div>
      </div>

      {/* Record counts */}
      {health?.records && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(health.records).map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{key}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Maintenance jobs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />Maintenance Jobs
          </h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {[
            { name: "Audit KYC", description: "Sync user is_verified flags with KYC approval status across all accounts.", fn: auditKyc, icon: <CheckCircle className="w-5 h-5 text-amber-500" /> },
            { name: "Sync Inventory", description: "Recalculate low-stock alerts for all active products.", fn: syncInventory, icon: <Database className="w-5 h-5 text-blue-500" /> },
          ].map(({ name, description, fn, icon }) => (
            <div key={name} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
              </div>
              <button onClick={() => runJob(name, fn)} disabled={running === name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                {running === name ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {running === name ? "Running..." : "Run"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminPageWrapper>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Box, RefreshCw, Search, X, AlertTriangle, Edit } from "lucide-react";
import { fetchVendorProducts, updateVendorProduct } from "@/lib/api/vendor";
import type { VendorProduct } from "@/lib/types";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function VendorInventoryPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [editing, setEditing]   = useState<Record<string, number>>({});
  const [saving, setSaving]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVendorProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveStock = async (id: string) => {
    const newStock = editing[id];
    if (newStock === undefined) return;
    setSaving(id);
    try {
      const fd = new FormData();
      fd.append("stock", String(newStock));
      await updateVendorProduct(id, fd);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: newStock } : p));
      const newEditing = { ...editing };
      delete newEditing[id];
      setEditing(newEditing);
      toast.success("Stock updated");
    } catch {
      toast.error("Failed to update stock");
    } finally {
      setSaving(null);
    }
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    return (p.name || "").toLowerCase().includes(search.toLowerCase());
  });

  const lowStock  = filtered.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= (p.low_stock_threshold ?? 10));
  const outOfStock = filtered.filter((p) => (p.stock ?? 0) === 0);
  const healthy   = filtered.filter((p) => (p.stock ?? 0) > (p.low_stock_threshold ?? 10));

  return (
    <VendorPageWrapper
      title="Inventory"
      subtitle="Monitor and update product stock levels."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Out of Stock", count: outOfStock.length, color: "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
          { label: "Low Stock", count: lowStock.length, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
          { label: "Healthy", count: healthy.length, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" },
        ].map(({ label, count, color }) => (
          <div key={label} className={cn("rounded-xl border p-4 text-center", color)}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No products found" />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-50 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                {["Product", "SKU", "Status", "Current Stock", "Threshold", "Update Stock"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((p) => {
                const stock = p.stock ?? 0;
                const threshold = p.low_stock_threshold ?? 10;
                const isOut = stock === 0;
                const isLow = !isOut && stock <= threshold;
                const newVal = editing[p.id];

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <Box className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category_name || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.sku || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status || "DRAFT"} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isOut && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        {isLow && !isOut && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        <span className={cn("text-sm font-bold", isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-900 dark:text-white")}>
                          {stock}
                        </span>
                        <span className="text-xs text-gray-400">units</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{threshold}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={newVal ?? stock}
                          onChange={(e) => setEditing({ ...editing, [p.id]: Number(e.target.value) })}
                          className="w-20 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {newVal !== undefined && newVal !== stock && (
                          <button
                            onClick={() => handleSaveStock(p.id)}
                            disabled={saving === p.id}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
                          >
                            {saving === p.id ? "…" : "Save"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </VendorPageWrapper>
  );
}

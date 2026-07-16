"use client";
import { useCallback, useEffect, useState } from "react";
import { Tag, RefreshCw } from "lucide-react";
import { fetchCategories } from "@/lib/api/vendor";
import type { Category } from "@/lib/types";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

export default function VendorCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCategories(await fetchCategories()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <VendorPageWrapper
      title="Categories"
      subtitle="Browse all product categories available in the marketplace."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState title="No categories found" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-default">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </VendorPageWrapper>
  );
}

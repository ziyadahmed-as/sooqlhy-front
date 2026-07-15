"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SkeletonTable } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";

export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface VendorTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
}

export function VendorTable<T>({
  columns,
  rows,
  loading,
  error,
  onRetry,
  emptyTitle = "No data found",
  emptyDescription,
  rowKey,
  onRowClick,
}: VendorTableProps<T>) {
  if (loading) return <SkeletonTable rows={6} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (rows.length === 0)
    return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/60">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-colors",
                onRowClick
                  ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  : "hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

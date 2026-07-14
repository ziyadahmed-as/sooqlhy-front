"use client";
import { useState } from 'react';
import { fetchBuyerOrders } from '@/lib/api/orders';
import { usePaginatedApi } from '@/lib/hooks/usePaginatedApi';
import type { Order } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonTable } from '@/components/shared/SkeletonCard';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function BuyerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orders, loading, error, page, totalPages, setPage, refetch } =
    usePaginatedApi<Order>(
      (p) => fetchBuyerOrders({ page: p, status: statusFilter }),
      10,
      [statusFilter]
    );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" /> My Orders
        </h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="">All</option>
          {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4"><SkeletonTable rows={6} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Your order history will appear here."
            action={<Link href="/buyer/catalog" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Browse Catalog</Link>}
          />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['Order #', 'Items', 'Total', 'Date', 'Status', 'Tracking'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    #{o.order_number || o.id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {o.items?.length ?? 0} item{o.items?.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    ${Number(o.total || o.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 font-mono">
                    {o.tracking_number || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

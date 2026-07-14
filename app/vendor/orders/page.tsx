"use client";
import { useState } from 'react';
import { VendorGuard } from '@/components/layout/VendorGuard';
import { fetchVendorOrders, updateOrderStatus } from '@/lib/api/orders';
import { usePaginatedApi } from '@/lib/hooks/usePaginatedApi';
import type { VendorOrder } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonTable } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Pagination } from '@/components/shared/Pagination';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function VendorOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: orders, loading, error, page, totalPages, setPage, refetch } =
    usePaginatedApi<VendorOrder>(
      (p) => fetchVendorOrders({ page: p, status: statusFilter }),
      10,
      [statusFilter]
    );

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      toast.success('Order status updated');
      refetch();
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <VendorGuard>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" /> Orders
          </h1>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-4"><SkeletonTable rows={8} /></div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders" description="Orders will appear here once customers place them." />
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Order #', 'Customer', 'Items', 'Total', 'Date', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                      #{order.order_number || order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {order.buyerName || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ${Number(order.total || order.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </VendorGuard>
  );
}

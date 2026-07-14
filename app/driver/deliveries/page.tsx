"use client";
import { useEffect, useState, useCallback } from 'react';
import { fetchDriverAssignments, updateDeliveryStatus } from '@/lib/api/driver';
import type { DriverAssignment } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FullPageSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Truck, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const DELIVERY_STATUSES = ['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

export default function DriverDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DriverAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDriverAssignments();
      setDeliveries(data.filter((d) => d.status !== 'REJECTED'));
    } catch (err: unknown) {
      setError((err as any)?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDeliveries(); }, [loadDeliveries]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateDeliveryStatus(orderId, newStatus);
      toast.success('Status updated');
      await loadDeliveries();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <FullPageSpinner />;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={loadDeliveries} /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Truck className="h-6 w-6 text-indigo-500" /> My Deliveries
        </h1>
        <button onClick={loadDeliveries} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          Refresh
        </button>
      </div>

      {deliveries.length === 0 ? (
        <EmptyState title="No active deliveries" description="Your assigned deliveries will appear here." icon={<Truck className="h-12 w-12" />} />
      ) : (
        <div className="space-y-4">
          {deliveries.map((d) => {
            const orderId = d.orderId ?? d.order_id ?? 0;
            const customerName = d.customerName ?? d.customer_name ?? 'Customer';
            const tracking = d.trackingNumber ?? d.tracking_number;
            return (
              <div key={d.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{customerName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {d.address}
                    </p>
                    {tracking && (
                      <p className="text-xs text-gray-400 mt-1">Tracking: {tracking}</p>
                    )}
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={d.status}
                    onChange={(e) => handleStatusChange(orderId, e.target.value)}
                    disabled={updatingId === orderId}
                    className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    {DELIVERY_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-400">Order #{orderId}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

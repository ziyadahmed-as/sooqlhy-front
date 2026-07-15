"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { fetchModerationQueue, approveProduct, rejectProduct, bulkApproveProducts } from '@/lib/api/moderator';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/shared/ProductCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { toast } from 'sonner';

export default function ModeratorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchModerationQueue();
      setProducts(data);
    } catch (e: unknown) {
      setError((e as any)?.message || 'Failed to load moderation queue');
      toast.error('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveProduct(id);
      toast.success('Product approved');
      loadQueue();
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve product');
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason');
    if (!reason) return;
    try {
      await rejectProduct(id, reason);
      toast.success('Product rejected');
      loadQueue();
    } catch (e) {
      console.error(e);
      toast.error('Failed to reject product');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      toast.info('No products selected');
      return;
    }
    try {
      await bulkApproveProducts(Array.from(selectedIds));
      toast.success('Bulk approval completed');
      setSelectedIds(new Set());
      loadQueue();
    } catch (e) {
      console.error(e);
      toast.error('Bulk approval failed');
    }
  };

  return (
    <section className="p-4">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Moderation Queue</h1>
        <button
          onClick={handleBulkApprove}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          Bulk Approve ({selectedIds.size})
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadQueue} />
      ) : products.length === 0 ? (
        <EmptyState title="No products awaiting review" description="The moderation queue is empty." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {products.map(p => (
            <div key={p.id} className="relative group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="absolute top-2 left-2 z-10">
                <StatusBadge status={p.status || 'SUBMITTED'} />
              </div>
              <div className="absolute top-2 right-2 z-10 flex space-x-2 opacity-0 group:hover:opacity-100 transition-opacity">
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <button
                  onClick={() => handleApprove(p.id)}
                  className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(p.id)}
                  className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

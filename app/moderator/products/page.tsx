"use client";
import React, { useEffect, useState } from 'react';
import { fetchModerationQueue, approveProduct, rejectProduct, bulkApproveProducts } from '@/lib/api/moderator';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/shared/ProductCard';
import { toast } from 'sonner';

// Simple status color helper (same as vendor page)
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'; // DRAFT
  }
};

export default function ModeratorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchModerationQueue();
      setProducts(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

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
        <p className="text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products awaiting review.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {products.map(p => (
            <div key={p.id} className="relative group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="absolute top-2 left-2 z-10">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(p.status)} shadow-sm`}></span>
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

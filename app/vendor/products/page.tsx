"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { VendorGuard } from '@/components/layout/VendorGuard';
import { fetchVendorProducts } from '@/lib/api/vendor';
import type { VendorProduct } from '@/lib/types';
import ProductCard from '@/components/shared/ProductCard';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Package } from 'lucide-react';

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVendorProducts();
      setProducts(data);
    } catch (err: unknown) {
      setError((err as any)?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  return (
    <VendorGuard>
      <section className="p-4">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6" /> Your Products
          </h1>
          <Link href="/vendor/products/new">
            <button className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors">
              Add New Product
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadProducts} />
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" description="Start by adding your first product." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {products.map(p => (
              <div key={p.id} className="relative group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="absolute top-2 left-2 z-10">
                  <StatusBadge status={p.status || 'DRAFT'} />
                </div>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/vendor/products/${p.id}/edit`}>
                    <button className="inline-flex items-center justify-center rounded-md bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800/90 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700">
                      Edit
                    </button>
                  </Link>
                </div>
                <ProductCard product={p} />
                {p.status === 'REJECTED' && p.rejection_reason && (
                  <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30">
                    <p className="text-xs text-red-600 dark:text-red-400 line-clamp-2">
                      <span className="font-semibold">Reason:</span> {p.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </VendorGuard>
  );
}

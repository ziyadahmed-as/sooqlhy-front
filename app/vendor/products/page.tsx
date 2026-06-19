"use client";
import React, { useEffect, useState } from 'react';
import { VendorGuard } from '@/components/layout/VendorGuard';
import { fetchVendorProducts } from '@/lib/api/vendor';
import type { VendorProduct } from '@/lib/types';
import ProductCard from '@/components/shared/ProductCard';
import Link from 'next/link';
import { MetricCard } from '@/components/shared/MetricCard';

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'; // DRAFT
  }
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);

  useEffect(() => {
    fetchVendorProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <VendorGuard>
      <section className="p-4">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Your Products</h1>
          <Link href="/vendor/products/new">
            <button className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors">
              Add New Product
            </button>
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-gray-500">You have no products yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {products.map(p => (
              <div key={p.id} className="relative group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="absolute top-2 left-2 z-10">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(p.status)} shadow-sm`}>
                    {p.status ? p.status.replace('_', ' ') : 'DRAFT'}
                  </span>
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

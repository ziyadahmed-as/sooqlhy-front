import React, { useEffect, useState } from 'react';
import { VendorGuard } from '@/components/layout/VendorGuard';
import { fetchVendorProducts } from '@/lib/api/vendor';
import type { VendorProduct } from '@/lib/types';
import ProductCard from '@/components/shared/ProductCard';
import Link from 'next/link';
import { MetricCard } from '@/components/shared/MetricCard';

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);

  useEffect(() => {
    fetchVendorProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <VendorGuard>
      <section className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Your Products</h1>
          <Link href="/vendor/products/new">
            <button className="btn-primary">Add New Product</button>
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-gray-500">You have no products yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="relative">
                <ProductCard product={p} />
                <Link href={`/vendor/products/${p.id}/edit`}>
                  <button className="absolute top-2 right-2 btn-primary btn-sm">Edit</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </VendorGuard>
  );
}

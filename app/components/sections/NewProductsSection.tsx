import React from 'react';
import Link from 'next/link';
import { useApprovedProducts } from '@/app/lib/hooks/useApprovedProducts';
import ProductCard from '@/components/shared/ProductCard';

/**
 * Section displaying newest approved products.
 * Fetches from backend endpoint `/api/products/new`.
 * The backend ensures vendor verification and product approval.
 */
const NewProductsSection: React.FC = () => {
  const { data: products, loading, error } = useApprovedProducts('/api/products/new', {
    limit: 8,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-[#FF4747] border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-sm text-zinc-500">Loading new products…</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-sm">Failed to load new products: {error}</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-zinc-500 text-sm">No new products available.</p>;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <h3 className="text-base font-extrabold text-zinc-950 mb-4 flex items-center gap-2">
        <span>🆕 New Arrivals</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((prod) => (
          <Link key={prod.id} href={`/buyer/catalog/${prod.id}`}>
            <ProductCard product={prod} />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NewProductsSection;

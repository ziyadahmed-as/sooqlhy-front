"use client";
import ProductCard from "@/components/shared/ProductCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import type { Product } from "@/lib/types";
import { Package } from "lucide-react";

interface Props {
  products: Product[];
  loading: boolean;
  gridView: boolean;
  pageSize: number;
  onQuickView: (p: Product) => void;
  onClearFilters: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export default function ProductGrid({
  products, loading, gridView, pageSize, onQuickView, onClearFilters, error, onRetry,
}: Props) {
  const gridClass = gridView
    ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
    : "grid grid-cols-1 gap-3";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: pageSize }).map((_, i) => (
          gridView ? (
            <SkeletonCard key={i} />
          ) : (
            <div key={i} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-3 animate-pulse">
              <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-5 bg-gray-100 rounded w-1/4 mt-auto" />
              </div>
            </div>
          )
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
        <Package className="w-12 h-12 text-red-200 mx-auto mb-4" />
        <p className="font-bold text-gray-900 text-lg mb-1">Failed to load products</p>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-trust transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
        <Package className="w-14 h-14 text-gray-200 mx-auto mb-5" />
        <p className="font-bold text-gray-900 text-xl mb-2">No products found</p>
        <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
          Try adjusting your filters or search term to see more results.
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-trust transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          listView={!gridView}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}

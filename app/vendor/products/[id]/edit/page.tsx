"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { VendorGuard } from '@/components/layout/VendorGuard';
import ProductForm from '@/components/vendor/ProductForm';
import { fetchProductDetails } from '@/lib/api/vendor';
import type { VendorProduct } from '@/lib/types';
import { toast } from 'sonner';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<VendorProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    fetchProductDetails(id)
      .then((data) => setProduct(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch product details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <VendorGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
            </div>
          ) : product ? (
            <ProductForm initialData={product} />
          ) : (
            <div className="text-center text-gray-500">Product not found.</div>
          )}
        </div>
      </div>
    </VendorGuard>
  );
}

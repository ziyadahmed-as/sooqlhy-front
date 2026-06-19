"use client";
import React from 'react';
import { VendorGuard } from '@/components/layout/VendorGuard';
import ProductForm from '@/components/vendor/ProductForm';

export default function NewProductPage() {
  return (
    <VendorGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ProductForm />
        </div>
      </div>
    </VendorGuard>
  );
}

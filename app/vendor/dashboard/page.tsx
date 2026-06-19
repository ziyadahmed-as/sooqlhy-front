"use client";
import { VendorGuard } from '@/components/layout/VendorGuard';
import Link from 'next/link';
import AnalyticsDashboard from '@/components/vendor/AnalyticsDashboard';

export default function DashboardPage() {
  return (
    <VendorGuard>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Vendor Dashboard</h1>
          <div className="flex space-x-4">
            <Link href="/vendor/products/new" className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-700 transition-colors">
              Add Product
            </Link>
            <Link href="/vendor/orders" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors">
              Manage Orders
            </Link>
          </div>
        </div>

        <AnalyticsDashboard />
        
      </div>
    </VendorGuard>
  );
}

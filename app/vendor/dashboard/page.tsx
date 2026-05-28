"use client";
import { useEffect, useState } from 'react';
import { VendorGuard } from '@/components/layout/VendorGuard';
import { fetchVendorStats, fetchLowStockProducts, fetchVendorProducts } from '@/lib/api/vendor';
import type { VendorStats, VendorProduct } from '@/lib/types';
import ProductCard from '@/components/shared/ProductCard';
import { MetricCard } from '@/components/shared/MetricCard';
import LowStockItem from '@/components/shared/LowStockItem';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { CashIcon, ClockIcon, TruckIcon, ExclamationIcon } from '@heroicons/react/outline';
import styles from '@/app/styles/vendor.module.css';

export default function DashboardPage() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [lowStock, setLowStock] = useState<VendorProduct[]>([]);
  const [products, setProducts] = useState<VendorProduct[]>([]);

  useEffect(() => {
    fetchVendorStats().then(setStats).catch(console.error);
    fetchLowStockProducts().then(setLowStock).catch(console.error);
    fetchVendorProducts().then(setProducts).catch(console.error);
  }, []);

  if (!stats) return <p>Loading…</p>;

  return (
    <VendorGuard>
      <section className={styles.dashboard}>
        {/* Metric cards */}
        <div className={styles.metricScroller}>
          <MetricCard
            icon={<CashIcon className="h-6 w-6 text-primary-600" />}
            label="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
          />
          <MetricCard
            icon={<ClockIcon className="h-6 w-6 text-primary-600" />}
            label="Orders This Month"
            value={stats.ordersThisMonth}
          />
          <MetricCard
            icon={<TruckIcon className="h-6 w-6 text-primary-600" />}
            label="Pending Orders"
            value={stats.pendingOrders}
          />
          <MetricCard
            icon={<ExclamationIcon className="h-6 w-6 text-primary-600" />}
            label="Low Stock Alerts"
            value={stats.lowStockCount}
          />
        </div>

        {/* Weekly revenue chart */}
        <div className={styles.chartContainer}>
          <h2 className="text-lg font-semibold mb-2">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyRevenue}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#1a5fa8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low‑stock list */}
        <section className={styles.lowStockSection}>
          <h2 className="text-lg font-semibold mb-2">Low Stock Products</h2>
          {lowStock.length === 0 ? (
            <p className="text-gray-500">All products are sufficiently stocked.</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map(p => (
                <LowStockItem key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* Your Products */}
        <section className={styles.productsSection}>
          <h2 className="text-lg font-semibold mb-2">Your Products</h2>
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

        {/* Quick actions */}
        <div className={styles.quickActions}>
          <Link href="/vendor/products/new">
            <button className="btn-primary">Add product</button>
          </Link>
          <Link href="/vendor/orders">
            <button className="btn-primary">View orders</button>
          </Link>
        </div>
      </section>
    </VendorGuard>
  );
}

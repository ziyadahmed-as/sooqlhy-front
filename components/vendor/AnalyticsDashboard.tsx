"use client";
import { useEffect, useState } from 'react';
import { fetchVendorAnalytics, exportVendorAnalytics } from '@/lib/api/analytics';
import type { AnalyticsData } from '@/lib/types';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Download, FileText, ShoppingBag, DollarSign,
  TrendingUp, Star, Truck, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { SkeletonMetricCard } from '@/components/shared/SkeletonCard';
import { ErrorState } from '@/components/shared/ErrorState';

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white px-4 pb-5 pt-5 shadow-sm sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md hover:-translate-y-1">
      <dt>
        <div className="absolute rounded-md bg-gray-50 dark:bg-gray-800 p-3">{icon}</div>
        <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      </dt>
      <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </dd>
    </div>
  );
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorAnalytics()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load analytics data");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      toast.info(`Exporting ${format.toUpperCase()}...`);
      await exportVendorAnalytics(format);
      toast.success("Export downloaded successfully");
    } catch (e) {
      toast.error("Failed to export analytics");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return <ErrorState message="No analytics data available." />;
  }

  const pieData = Object.entries(data.rating_distribution).map(([rating, count]) => ({
    name: `${rating} Star`,
    value: count
  }));

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics Overview</h2>
        <div className="flex space-x-3">
          <button onClick={() => handleExport('csv')} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-700 transition-colors">
            <FileText className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" />
            Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors">
            <Download className="-ml-0.5 mr-1.5 h-5 w-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue (YTD)" value={`$${data.revenue_year.toFixed(2)}`} icon={<DollarSign className="h-6 w-6 text-emerald-500" />} />
        <MetricCard title="Total Orders" value={data.total_orders.toString()} icon={<ShoppingBag className="h-6 w-6 text-blue-500" />} />
        <MetricCard title="Customer Satisfaction" value={`${data.customer_satisfaction.toFixed(1)} / 5`} icon={<Star className="h-6 w-6 text-amber-500" />} />
        <MetricCard title="Delivery Rating" value={`${data.delivery_rating.toFixed(1)} / 5`} icon={<Truck className="h-6 w-6 text-purple-500" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary-500" /> Revenue Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenue_trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Volume */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-primary-500" /> Order Volume (30 Days)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.order_volume} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" stroke="#6B7280" tickFormatter={(val) => new Date(val).getDate().toString()} />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Rating Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-1">
          <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
            <Star className="mr-2 h-5 w-5 text-amber-500" /> Rating Distribution
          </h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No ratings yet</div>
            )}
          </div>
        </div>

        {/* Product Insights Table */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2 overflow-hidden">
          <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
            <ArrowUpRight className="mr-2 h-5 w-5 text-primary-500" /> Product Insights
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. %</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.product_insights.slice(0, 5).map((product, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{product.views}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{product.conversion_rate}%</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        product.stock < 20 ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {product.stock} left
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {product.price_suggestion ? (
                        <span className="flex items-center text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="mr-1 w-4 h-4" /> Drop to ${product.price_suggestion}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.product_insights.length === 0 && (
              <div className="text-center py-6 text-gray-500">No product insights available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from 'react';
import { fetchAdminStats, fetchUsers, fetchKycRecords } from '@/lib/api/admin';
import { fetchDailyAnalytics } from '@/lib/api/analytics';
import type { AdminStats, User, KycRecord, DailyAnalytics } from '@/lib/types';
import { SkeletonMetricCard } from '@/components/shared/SkeletonCard';
import { ErrorState } from '@/components/shared/ErrorState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Users, ShoppingBag, Store, TrendingUp,
  AlertCircle, CheckCircle, BarChart2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function StatCard({ title, value, icon, color }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className={`absolute right-4 top-4 rounded-lg p-2 ${color}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
        {value ?? '—'}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [pendingKyc, setPendingKyc] = useState<KycRecord[]>([]);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, usersData, kycData, analyticsData] = await Promise.allSettled([
        fetchAdminStats(),
        fetchUsers({ page: 1, page_size: 5 }),
        fetchKycRecords({ status: 'PENDING', page: 1, page_size: 5 }),
        fetchDailyAnalytics(),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (usersData.status === 'fulfilled') setRecentUsers(usersData.value.results);
      if (kycData.status === 'fulfilled') setPendingKyc(kycData.value.results);
      if (analyticsData.status === 'fulfilled') setDailyAnalytics(analyticsData.value.slice(-14));
    } catch (err: unknown) {
      setError((err as any)?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) return <div className="p-6"><ErrorState message={error} onRetry={loadData} /></div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <button onClick={loadData} className="text-sm text-primary-600 hover:underline">Refresh</button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Users" value={stats?.total_users ?? 0} icon={<Users className="h-5 w-5 text-blue-600" />} color="bg-blue-50 dark:bg-blue-900/20" />
            <StatCard title="Total Vendors" value={stats?.total_vendors ?? 0} icon={<Store className="h-5 w-5 text-purple-600" />} color="bg-purple-50 dark:bg-purple-900/20" />
            <StatCard title="Total Orders" value={stats?.total_orders ?? 0} icon={<ShoppingBag className="h-5 w-5 text-green-600" />} color="bg-green-50 dark:bg-green-900/20" />
            <StatCard title="Total Revenue" value={`$${(stats?.total_revenue ?? 0).toFixed(2)}`} icon={<TrendingUp className="h-5 w-5 text-amber-600" />} color="bg-amber-50 dark:bg-amber-900/20" />
          </>
        )}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Buyers" value={stats?.total_buyers ?? 0} icon={<Users className="h-5 w-5 text-cyan-600" />} color="bg-cyan-50 dark:bg-cyan-900/20" />
            <StatCard title="Drivers" value={stats?.total_drivers ?? 0} icon={<TrendingUp className="h-5 w-5 text-indigo-600" />} color="bg-indigo-50 dark:bg-indigo-900/20" />
            <StatCard title="Pending KYC" value={stats?.pending_kyc ?? 0} icon={<AlertCircle className="h-5 w-5 text-orange-600" />} color="bg-orange-50 dark:bg-orange-900/20" />
            <StatCard title="Pending Moderation" value={stats?.pending_moderation ?? 0} icon={<CheckCircle className="h-5 w-5 text-red-600" />} color="bg-red-50 dark:bg-red-900/20" />
          </>
        )}
      </div>

      {/* Analytics Charts */}
      {dailyAnalytics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary-500" />
              Daily Page Views (14 days)
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="page_views" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Registrations & Conversions</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Users & Pending KYC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Users</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <p className="p-4 text-sm text-gray-500">Loading…</p>
            ) : recentUsers.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No users found.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name || u.email}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <StatusBadge status={u.role?.toUpperCase()} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending KYC */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pending KYC</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <p className="p-4 text-sm text-gray-500">Loading…</p>
            ) : pendingKyc.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No pending KYC requests.</p>
            ) : (
              pendingKyc.map((kyc) => (
                <div key={kyc.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {kyc.user_email || `User #${kyc.user}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <StatusBadge status={kyc.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

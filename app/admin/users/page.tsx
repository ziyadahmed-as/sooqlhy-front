"use client";
import { useState, useCallback } from 'react';
import { fetchUsers } from '@/lib/api/admin';
import { usePaginatedApi } from '@/lib/hooks/usePaginatedApi';
import type { User } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonTable } from '@/components/shared/SkeletonCard';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { Search, Users } from 'lucide-react';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');

  const { data: users, loading, error, page, totalPages, setPage, refetch } =
    usePaginatedApi<User>(
      (p) => fetchUsers({ page: p, search }),
      10,
      [search]
    );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-6 w-6" /> User Management
        </h1>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4"><SkeletonTable rows={10} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try a different search." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['Name', 'Email', 'Role', 'Verified'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {u.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={u.role?.toUpperCase()} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${u.is_verified ? 'text-green-600' : 'text-red-500'}`}>
                      {u.is_verified ? '✓ Verified' : '✗ Unverified'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

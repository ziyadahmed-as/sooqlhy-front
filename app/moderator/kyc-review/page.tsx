"use client";
import { useCallback } from 'react';
import { fetchKycRecords, approveKyc, rejectKyc } from '@/lib/api/admin';
import { usePaginatedApi } from '@/lib/hooks/usePaginatedApi';
import type { KycRecord } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonTable } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Pagination } from '@/components/shared/Pagination';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ModeratorKycReviewPage() {
  const { data: records, loading, error, page, totalPages, setPage, refetch } =
    usePaginatedApi<KycRecord>(
      (p) => fetchKycRecords({ status: 'PENDING', page: p }),
      10
    );

  const handleApprove = async (id: number) => {
    try {
      await approveKyc(id);
      toast.success('KYC record approved');
      refetch();
    } catch {
      toast.error('Failed to approve KYC');
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await rejectKyc(id, reason);
      toast.success('KYC record rejected');
      refetch();
    } catch {
      toast.error('Failed to reject KYC');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" /> KYC Review Queue
        </h1>
        <button onClick={refetch} className="text-sm text-primary-600 hover:underline">Refresh</button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4"><SkeletonTable rows={6} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : records.length === 0 ? (
          <EmptyState title="No pending KYC requests" description="All KYC reviews are up to date." />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['User', 'Submitted', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {records.map((kyc) => (
                <tr key={kyc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {kyc.user_email || `User #${kyc.user}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={kyc.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(kyc.id)}
                        className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(kyc.id)}
                        className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
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

"use client";
import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchDriverAssignments,
  acceptAssignment,
  rejectAssignment,
  updateDeliveryStatus,
  uploadProof,
} from '@/lib/api/driver';
import type { DriverAssignment } from '@/lib/types';
import AssignmentCard from '@/components/driver/AssignmentCard';
import { FullPageSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function DriverDashboard() {
  const [assignments, setAssignments] = useState<DriverAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDriverAssignments();
      setAssignments(data);
    } catch (err: unknown) {
      setError((err as any)?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleAccept = async (id: number) => {
    try {
      await acceptAssignment(id);
      toast.success('Assignment accepted');
      await loadAssignments();
    } catch {
      toast.error('Failed to accept assignment');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectAssignment(id);
      toast.success('Assignment rejected');
      await loadAssignments();
    } catch {
      toast.error('Failed to reject assignment');
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateDeliveryStatus(orderId, newStatus);
      toast.success('Status updated');
      await loadAssignments();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleProofUpload = async (orderId: number, files: FileList) => {
    try {
      const proof = files[0];
      const signature = files[1];
      await uploadProof(orderId, proof, signature);
      toast.success('Proof uploaded successfully');
      await loadAssignments();
    } catch {
      toast.error('Failed to upload proof');
    }
  };

  if (loading) return <FullPageSpinner />;

  if (error) {
    return (
      <section className="p-6">
        <ErrorState message={error} onRetry={loadAssignments} />
      </section>
    );
  }

  return (
    <section className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-indigo-500" />
            Driver Dashboard
          </h1>
          <button
            onClick={loadAssignments}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Refresh
          </button>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments"
            description="You have no active delivery assignments at the moment."
            icon={<Truck className="h-12 w-12" />}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onAccept={() => handleAccept(a.id)}
                onReject={() => handleReject(a.id)}
                onStatusChange={(status) =>
                  handleStatusUpdate(a.orderId ?? a.order_id ?? 0, status)
                }
                onProofUpload={(files) =>
                  handleProofUpload(a.orderId ?? a.order_id ?? 0, files)
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

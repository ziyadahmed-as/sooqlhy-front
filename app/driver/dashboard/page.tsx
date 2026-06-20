// File: app/driver/dashboard/page.tsx
import React, { useEffect, useState } from 'react';
import { fetchDriverAssignments, acceptAssignment, rejectAssignment, updateDeliveryStatus, uploadProof } from '@/lib/api/driver';
import AssignmentCard from '@/components/driver/AssignmentCard';

interface Assignment {
  id: number;
  orderId: number;
  customerName: string;
  address: string;
  status: string;
  trackingNumber?: string;
}

const DriverDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = async () => {
    setLoading(true);
    const data = await fetchDriverAssignments();
    setAssignments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleAccept = async (id: number) => {
    await acceptAssignment(id);
    await loadAssignments();
  };

  const handleReject = async (id: number) => {
    await rejectAssignment(id);
    await loadAssignments();
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    await updateDeliveryStatus(orderId, newStatus);
    await loadAssignments();
  };

  const handleProofUpload = async (orderId: number, files: FileList) => {
    const proof = files[0];
    const signature = files[1]; // optional second file
    await uploadProof(orderId, proof, signature);
    await loadAssignments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <section className="p-6 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Driver Dashboard
      </h1>
      {assignments.length === 0 ? (
        <p className="text-center text-gray-600">No assignments at the moment.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onAccept={() => handleAccept(a.id)}
              onReject={() => handleReject(a.id)}
              onStatusChange={(status) => handleStatusUpdate(a.orderId, status)}
              onProofUpload={(files) => handleProofUpload(a.orderId, files)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default DriverDashboard;

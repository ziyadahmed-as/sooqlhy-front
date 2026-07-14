// lib/api/driver.ts – Uses authenticated axios instance
import api from '@/lib/api/axios';
import type { DriverAssignment } from '@/lib/types';

export interface DriverProfile {
  id: number;
  userId: number;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'RESTING';
  maxConcurrentDeliveries: number;
  latitude?: number;
  longitude?: number;
  rating?: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

export interface OrderStatusUpdate {
  status: string;
  eta?: string;
}

export const getDriverProfile = async (driverId: number): Promise<DriverProfile> => {
  const { data } = await api.get<DriverProfile>(`/api/driver/profile/${driverId}/`);
  return data;
};

export const updateDriverStatus = async (driverId: number, status: string): Promise<void> => {
  await api.patch(`/api/driver/profile/${driverId}/`, { status });
};

export const updateDriverLocation = async (driverId: number, latitude: number, longitude: number): Promise<void> => {
  await api.post(`/api/driver/location/${driverId}/`, { latitude, longitude } as LocationUpdate);
};

/** Fetch all assignments for a specific driver */
export const getAssignments = async (driverId: number): Promise<DriverAssignment[]> => {
  const { data } = await api.get<DriverAssignment[]>(`/api/driver/assignments/${driverId}/`);
  return data;
};

/** Fetch assignments for the currently authenticated driver */
export const fetchDriverAssignments = async (): Promise<DriverAssignment[]> => {
  const { data } = await api.get<DriverAssignment[]>('/api/driver/assignments/');
  return Array.isArray(data) ? data : (data as any).results ?? [];
};

export const acceptAssignment = async (assignmentId: number): Promise<void> => {
  await api.post(`/api/driver/assignments/${assignmentId}/accept/`);
};

export const rejectAssignment = async (assignmentId: number): Promise<void> => {
  await api.post(`/api/driver/assignments/${assignmentId}/reject/`);
};

export const updateDeliveryStatus = async (orderId: number, status: string, eta?: string): Promise<void> => {
  await api.post(`/api/driver/order/${orderId}/status/`, { status, eta } as OrderStatusUpdate);
};

export const uploadProof = async (orderId: number, proofFile: File, signatureFile?: File): Promise<void> => {
  const form = new FormData();
  form.append('proof', proofFile);
  if (signatureFile) form.append('signature', signatureFile);
  await api.post(`/api/driver/order/${orderId}/proof/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

import axios from 'axios';
import type { DriverProfile, DriverAssignment, LocationUpdate, OrderStatusUpdate } from '../typings/driver';

const API_BASE = '/api/driver';

export const getDriverProfile = async (driverId: number): Promise<DriverProfile> => {
  const response = await axios.get<DriverProfile>(`${API_BASE}/profile/${driverId}/`);
  return response.data;
};

export const updateDriverStatus = async (driverId: number, status: string): Promise<void> => {
  await axios.patch(`${API_BASE}/profile/${driverId}/`, { status });
};

export const updateDriverLocation = async (driverId: number, latitude: number, longitude: number): Promise<void> => {
  const payload: LocationUpdate = { latitude, longitude };
  await axios.post(`${API_BASE}/location/${driverId}/`, payload);
};

export const getAssignments = async (driverId: number): Promise<DriverAssignment[]> => {
  const response = await axios.get<DriverAssignment[]>(`${API_BASE}/assignments/${driverId}/`);
  return response.data;
};

// New wrapper for the current driver (assumes authentication provides driver context)
export const fetchDriverAssignments = async (): Promise<DriverAssignment[]> => {
  // Calls the endpoint without driverId, expecting backend to infer the driver from auth token
  const response = await axios.get<DriverAssignment[]>(`${API_BASE}/assignments/`);
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string, eta?: string): Promise<void> => {
  const payload: OrderStatusUpdate = { status, eta };
  await axios.post(`${API_BASE}/order/${orderId}/status/`, payload);
};

export const uploadDeliveryProof = async (orderId: number, proofFile: File, signatureFile?: File): Promise<void> => {
  const form = new FormData();
  form.append('proof', proofFile);
  if (signatureFile) form.append('signature', signatureFile);
  await axios.post(`${API_BASE}/order/${orderId}/proof/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ---------------------------------------------------------------------------
// Additional driver actions used by the frontend dashboard
// ---------------------------------------------------------------------------

/** Accept an assignment by its ID */
export const acceptAssignment = async (assignmentId: number): Promise<void> => {
  await axios.post(`${API_BASE}/assignments/${assignmentId}/accept/`);
};

/** Reject an assignment by its ID */
export const rejectAssignment = async (assignmentId: number): Promise<void> => {
  await axios.post(`${API_BASE}/assignments/${assignmentId}/reject/`);
};

/** Update delivery status for an order (wrapper around updateOrderStatus) */
export const updateDeliveryStatus = async (
  orderId: number,
  status: string,
  eta?: string
): Promise<void> => {
  // Re‑use the generic order‑status endpoint
  await updateOrderStatus(orderId, status, eta);
};

/** Upload proof of delivery – wrapper around uploadDeliveryProof */
export const uploadProof = async (
  orderId: number,
  proofFile: File,
  signatureFile?: File
): Promise<void> => {
  await uploadDeliveryProof(orderId, proofFile, signatureFile);
};

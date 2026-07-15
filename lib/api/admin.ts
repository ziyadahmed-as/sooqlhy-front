// lib/api/admin.ts
import api from '@/lib/api/axios';
import type { AdminStats, User, PaginatedResponse, KycRecord } from '@/lib/types';

/**
 * Fetch admin dashboard summary statistics.
 * Backend: GET /api/users/admin-stats/
 */
export const fetchAdminStats = async (): Promise<AdminStats> => {
  const { data } = await api.get<AdminStats>('/api/users/admin-stats/');
  return data;
};

/**
 * Fetch paginated user list.
 * Backend: GET /api/users/users/
 */
export const fetchUsers = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<User>> => {
  const { data } = await api.get<PaginatedResponse<User>>('/api/users/users/', { params });
  return data;
};

/**
 * Update a user (e.g., deactivate, change role).
 * Backend: PATCH /api/users/users/{id}/
 */
export const updateUser = async (id: string, payload: Partial<User>): Promise<User> => {
  const { data } = await api.patch<User>(`/api/users/users/${id}/`, payload);
  return data;
};

/**
 * Fetch paginated KYC records.
 * Backend: GET /api/kyc/records/
 */
export const fetchKycRecords = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<KycRecord>> => {
  const { data } = await api.get<PaginatedResponse<KycRecord>>('/api/kyc/records/', { params });
  return data;
};

/**
 * Approve a KYC record.
 * Backend: POST /api/kyc/records/{id}/approve/
 * KYC record IDs are UUIDs (strings).
 */
export const approveKyc = async (id: string): Promise<void> => {
  await api.post(`/api/kyc/records/${id}/approve/`);
};

/**
 * Reject a KYC record with a reason.
 * Backend: POST /api/kyc/records/{id}/reject/
 */
export const rejectKyc = async (id: string, reason: string): Promise<void> => {
  await api.post(`/api/kyc/records/${id}/reject/`, { reason });
};

/**
 * Fetch KYC summary stats.
 * Backend: GET /api/kyc/records/summary/
 */
export const fetchKycSummary = async () => {
  const { data } = await api.get('/api/kyc/records/summary/');
  return data;
};

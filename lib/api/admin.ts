// lib/api/admin.ts
import api from '@/lib/api/axios';
import type { AdminStats, User, PaginatedResponse, KycRecord } from '@/lib/types';

/** Fetch admin dashboard summary statistics */
export const fetchAdminStats = async (): Promise<AdminStats> => {
  const { data } = await api.get<AdminStats>('/api/analytics/admin/stats/');
  return data;
};

/** Fetch paginated user list */
export const fetchUsers = async (params?: Record<string, string | number>): Promise<PaginatedResponse<User>> => {
  const { data } = await api.get<PaginatedResponse<User>>('/api/users/users/', { params });
  return data;
};

/** Fetch paginated KYC records for admin review */
export const fetchKycRecords = async (params?: Record<string, string | number>): Promise<PaginatedResponse<KycRecord>> => {
  const { data } = await api.get<PaginatedResponse<KycRecord>>('/api/kyc/records/', { params });
  return data;
};

/** Approve a KYC record */
export const approveKyc = async (id: number): Promise<KycRecord> => {
  const { data } = await api.post<KycRecord>(`/api/kyc/records/${id}/approve/`);
  return data;
};

/** Reject a KYC record */
export const rejectKyc = async (id: number, reason: string): Promise<KycRecord> => {
  const { data } = await api.post<KycRecord>(`/api/kyc/records/${id}/reject/`, { reason });
  return data;
};

/** Update a user (e.g., deactivate, change role) */
export const updateUser = async (id: string, payload: Partial<User>): Promise<User> => {
  const { data } = await api.patch<User>(`/api/users/users/${id}/`, payload);
  return data;
};

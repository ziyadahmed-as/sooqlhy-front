// lib/api/admin.ts — Complete Admin & Super Admin API layer
import api from '@/lib/api/axios';
import type { AdminStats, User, PaginatedResponse, KycRecord } from '@/lib/types';

// ─── Extended AdminStats type ─────────────────────────────────────────────────
export interface FullAdminStats extends AdminStats {
  total_moderators: number;
  pending_orders: number;
  processing_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  active_deliveries: number;
  failed_deliveries: number;
  total_complaints: number;
  open_complaints: number;
  resolved_complaints: number;
  escalated_complaints: number;
  total_products: number;
  active_products: number;
  suspended_users: number;
}

export interface CommissionRate {
  id: number;
  name: string;
  percentage: string;
  is_active: boolean;
}

export interface AdminWallet {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  user_role: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface AdminWithdrawal {
  id: number;
  wallet: number;
  user_email: string;
  user_name: string;
  wallet_balance: string;
  amount: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bank_details: string;
  created_at: string;
  processed_at: string | null;
}

export interface RevenuePoint {
  period: string;
  revenue: number;
  order_count: number;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  user: number | null;
  actor: number | null;
  description: string;
  timestamp: string;
  kyc_id: string | null;
  kyc_type: string | null;
  items: Record<string, unknown>;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export const fetchAdminStats = async (): Promise<FullAdminStats> => {
  const { data } = await api.get<FullAdminStats>('/api/users/admin-stats/');
  return data;
};

export const fetchAdminRevenueStats = async (
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
): Promise<{ period: string; data: RevenuePoint[] }> => {
  const { data } = await api.get('/api/users/admin-revenue-stats/', { params: { period } });
  return data;
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const fetchUsers = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<User>> => {
  const { data } = await api.get<PaginatedResponse<User>>('/api/users/users/', { params });
  return data;
};

export const fetchUser = async (id: string): Promise<User> => {
  const { data } = await api.get<User>(`/api/users/users/${id}/`);
  return data;
};

export const updateUser = async (id: string, payload: Partial<User>): Promise<User> => {
  const { data } = await api.patch<User>(`/api/users/users/${id}/`, payload);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/api/users/users/${id}/`);
};

export const suspendUser = async (id: string): Promise<User> => {
  return updateUser(id, { is_active: false } as any);
};

export const activateUser = async (id: string): Promise<User> => {
  return updateUser(id, { is_active: true } as any);
};

// ─── KYC ─────────────────────────────────────────────────────────────────────

export const fetchKycRecords = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<KycRecord>> => {
  const { data } = await api.get<PaginatedResponse<KycRecord>>('/api/kyc/records/', { params });
  return data;
};

export const approveKyc = async (id: string, comment?: string): Promise<void> => {
  await api.post(`/api/kyc/records/${id}/approve/`, { comment: comment ?? '' });
};

export const rejectKyc = async (id: string, reason: string): Promise<void> => {
  await api.post(`/api/kyc/records/${id}/reject/`, { reason });
};

export const fetchKycSummary = async () => {
  const { data } = await api.get('/api/kyc/records/summary/');
  return data;
};

// ─── Products ────────────────────────────────────────────────────────────────

export const fetchAdminProducts = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<any>> => {
  const { data } = await api.get('/api/products/moderation/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

export const approveProduct = async (id: string) => {
  const { data } = await api.post(`/api/products/moderation/${id}/approve/`);
  return data;
};

export const rejectProduct = async (id: string, reason: string) => {
  const { data } = await api.post(`/api/products/moderation/${id}/reject/`, { reason });
  return data;
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const fetchAdminOrders = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<any>> => {
  const { data } = await api.get('/api/orders/moderator/orders/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

// ─── Complaints ───────────────────────────────────────────────────────────────

export const fetchAdminComplaints = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<any>> => {
  const { data } = await api.get('/api/complaints/complaints/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

export const fetchComplaintStats = async () => {
  const { data } = await api.get('/api/complaints/complaints/stats/');
  return data;
};

export const updateComplaintStatus = async (id: number, status: string, note?: string) => {
  const { data } = await api.post(`/api/complaints/complaints/${id}/update-status/`, { status, note });
  return data;
};

export const assignComplaintModerator = async (id: number, moderatorId: number) => {
  const { data } = await api.post(`/api/complaints/complaints/${id}/assign/`, { moderator_id: moderatorId });
  return data;
};

export const escalateComplaint = async (id: number, reason: string) => {
  const { data } = await api.post(`/api/complaints/complaints/${id}/escalate/`, { reason });
  return data;
};

// ─── Finance Admin ────────────────────────────────────────────────────────────

export const fetchFinanceSummary = async () => {
  const { data } = await api.get('/api/finance/admin/wallets/summary/');
  return data;
};

export const fetchAllWallets = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<AdminWallet>> => {
  const { data } = await api.get('/api/finance/admin/wallets/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

export const fetchAllWithdrawals = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<AdminWithdrawal>> => {
  const { data } = await api.get('/api/finance/admin/withdrawals/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

export const approveWithdrawal = async (id: number): Promise<AdminWithdrawal> => {
  const { data } = await api.post<AdminWithdrawal>(`/api/finance/admin/withdrawals/${id}/approve/`);
  return data;
};

export const rejectWithdrawal = async (id: number, reason?: string): Promise<AdminWithdrawal> => {
  const { data } = await api.post<AdminWithdrawal>(
    `/api/finance/admin/withdrawals/${id}/reject/`,
    { reason: reason ?? '' }
  );
  return data;
};

// ─── Commission Rates ─────────────────────────────────────────────────────────

export const fetchCommissionRates = async (): Promise<CommissionRate[]> => {
  const { data } = await api.get('/api/finance/admin/commission-rates/');
  return Array.isArray(data) ? data : data.results ?? [];
};

export const createCommissionRate = async (
  payload: Omit<CommissionRate, 'id'>
): Promise<CommissionRate> => {
  const { data } = await api.post<CommissionRate>('/api/finance/admin/commission-rates/', payload);
  return data;
};

export const updateCommissionRate = async (
  id: number, payload: Partial<CommissionRate>
): Promise<CommissionRate> => {
  const { data } = await api.patch<CommissionRate>(`/api/finance/admin/commission-rates/${id}/`, payload);
  return data;
};

export const deleteCommissionRate = async (id: number): Promise<void> => {
  await api.delete(`/api/finance/admin/commission-rates/${id}/`);
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const fetchAuditLogs = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<AuditLogEntry>> => {
  const { data } = await api.get('/api/users/audit-logs/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

// ─── Zone Assignments ─────────────────────────────────────────────────────────

export const fetchZoneAssignments = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<any>> => {
  const { data } = await api.get('/api/complaints/zone-assignments/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

export const assignModeratorToZone = async (moderatorId: number, zoneId: number) => {
  const { data } = await api.post('/api/complaints/zone-assignments/', {
    moderator: moderatorId,
    zone: zoneId,
    is_active: true,
  });
  return data;
};

export const removeModeratorZone = async (assignmentId: number) => {
  await api.delete(`/api/complaints/zone-assignments/${assignmentId}/`);
};

// ─── Delivery Zones ───────────────────────────────────────────────────────────

export const fetchDeliveryZones = async (
  params?: Record<string, string | number>
): Promise<any[]> => {
  const { data } = await api.get('/api/orders/zones/', { params });
  return Array.isArray(data) ? data : data.results ?? [];
};

export const createDeliveryZone = async (payload: any) => {
  const { data } = await api.post('/api/orders/zones/', payload);
  return data;
};

export const updateDeliveryZone = async (id: number, payload: any) => {
  const { data } = await api.patch(`/api/orders/zones/${id}/`, payload);
  return data;
};

export const deleteDeliveryZone = async (id: number) => {
  await api.delete(`/api/orders/zones/${id}/`);
};

// ─── Broadcast Notifications ──────────────────────────────────────────────────

export const broadcastNotification = async (
  title: string, message: string, role?: string
): Promise<{ detail: string }> => {
  const { data } = await api.post('/api/users/admin-broadcast/', { title, message, role });
  return data;
};

// ─── System Health ────────────────────────────────────────────────────────────

export const fetchSystemHealth = async () => {
  const { data } = await api.get('/api/users/admin/health/');
  return data;
};

export const auditKyc = async () => {
  const { data } = await api.post('/api/users/admin/audit-kyc/');
  return data;
};

export const syncInventory = async () => {
  const { data } = await api.post('/api/users/admin/sync-inventory/');
  return data;
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const fetchDailyAnalytics = async (
  params?: Record<string, string | number>
): Promise<any[]> => {
  const { data } = await api.get('/api/analytics/daily/', { params });
  return Array.isArray(data) ? data : data.results ?? [];
};

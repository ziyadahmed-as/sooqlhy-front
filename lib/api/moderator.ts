// lib/api/moderator.ts — Full Moderator API
import api from '@/lib/api/axios';
import type { PaginatedResponse } from '@/lib/types';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ModeratorStats {
  total_vendors: number;
  active_vendors: number;
  pending_vendor_kyc: number;
  total_drivers: number;
  active_drivers: number;
  pending_driver_kyc: number;
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  delivery_success_rate: number;
  total_complaints: number;
  open_complaints: number;
  resolved_complaints: number;
  pending_kyc_total: number;
  product_queue: number;
  zone_count: number;
}

export interface ComplaintNote {
  id: number;
  complaint: number;
  author: number | null;
  author_name: string;
  note_type: 'INTERNAL' | 'CUSTOMER' | 'VENDOR' | 'DRIVER' | 'MODERATOR' | 'SYSTEM';
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface Complaint {
  id: number;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NEW' | 'UNDER_REVIEW' | 'WAITING' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  subject: string;
  description: string;
  internal_notes: string;
  resolution_notes: string;
  evidence_requested: boolean;
  evidence_received: boolean;
  submitted_by: number;
  submitted_by_email: string;
  submitted_by_name: string;
  against_vendor: number | null;
  against_vendor_email: string | null;
  against_driver: number | null;
  against_driver_email: string | null;
  assigned_moderator: number | null;
  assigned_moderator_name: string | null;
  order: number | null;
  order_number: number | null;
  zone: number | null;
  zone_name: string | null;
  notes: ComplaintNote[];
  note_count: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  escalated_at: string | null;
}

export interface ModeratorZone {
  id: number;
  moderator: number;
  moderator_name: string;
  moderator_email: string;
  zone: number;
  zone_name: string;
  zone_city: string;
  zone_country: string;
  is_active: boolean;
  assigned_by: number | null;
  assigned_at: string;
}

export interface ModeratorUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  phone_number: string | null;
  is_verified: boolean;
  is_active: boolean;
  date_joined: string;
  vendor_profile?: {
    store_name: string;
    business_name: string;
    verification_status: string;
    is_suspended: boolean;
    subscription_tier: string;
  };
  driver_profile?: {
    vehicle_type: string;
    license_number: string;
    status: string;
    plate_number: string;
  };
}

export interface ComplaintStats {
  total: number;
  new: number;
  under_review: number;
  waiting: number;
  resolved: number;
  closed: number;
  escalated: number;
  today: number;
  resolution_rate: number;
  by_category: { category: string; count: number }[];
}

// ─── Product Moderation (existing, re-exported) ───────────────────────────

export const fetchModerationQueue = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<any>> => {
  const { data } = await api.get('/api/products/moderation/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

export const approveProduct = async (id: string): Promise<{ status: string }> => {
  const { data } = await api.post(`/api/products/moderation/${id}/approve/`);
  return data;
};

export const rejectProduct = async (id: string, reason: string) => {
  const { data } = await api.post(`/api/products/moderation/${id}/reject/`, { reason });
  return data;
};

export const bulkApproveProducts = async (productIds: string[]) => {
  const { data } = await api.post('/api/products/moderation/bulk_approve/', { product_ids: productIds });
  return data;
};

// ─── KYC Types ────────────────────────────────────────────────────────────

export interface KycApplicantVendorProfile {
  store_name: string;
  business_name: string;
  business_type: string;
  verification_status: string;
}

export interface KycApplicantDriverProfile {
  vehicle_type: string;
  plate_number: string;
  license_number: string;
  status: string;
}

export interface KycApplicant {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string | null;
  is_verified: boolean;
  is_active: boolean;
  date_joined: string;
  vendor_profile: KycApplicantVendorProfile | null;
  driver_profile: KycApplicantDriverProfile | null;
}

export interface KycReviewEntry {
  id: number;
  kyc_record: string;
  reviewer: number | null;
  reviewer_name: string;
  status: string;
  admin_comments: string;
  rejection_reason: string;
  reviewed_at: string;
}

export interface KycRecord {
  id: string;
  user: number;
  user_details: KycApplicant;
  user_email: string;
  user_role: string;
  kyc_type: string;
  document_number: string;
  document_file: string | null;
  LIVE_PHOTO: string | null;
  file_size: number | null;
  file_type: string | null;
  status: string;
  verification_score: number | null;
  expiry_date: string | null;
  extracted_data: Record<string, unknown>;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  rejection_reason: string;
  reviewed_at: string | null;
  reviews: KycReviewEntry[];
}

// ─── KYC API ──────────────────────────────────────────────────────────────

export const fetchKycRecords = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<KycRecord>> => {
  const { data } = await api.get('/api/kyc/records/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

export const fetchKycUserRecords = async (recordId: string): Promise<KycRecord[]> => {
  const { data } = await api.get(`/api/kyc/records/${recordId}/user-records/`);
  return Array.isArray(data) ? data : [];
};

export const approveKyc = async (id: string, comment?: string) => {
  await api.post(`/api/kyc/records/${id}/approve/`, { comment: comment ?? '' });
};

export const rejectKyc = async (id: string, reason: string, comment?: string) => {
  await api.post(`/api/kyc/records/${id}/reject/`, { reason, comment: comment ?? '' });
};

export const fetchKycSummary = async () => {
  const { data } = await api.get('/api/kyc/records/summary/');
  return data;
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────

export const fetchModeratorStats = async (): Promise<ModeratorStats> => {
  const { data } = await api.get<ModeratorStats>('/api/complaints/moderator-stats/');
  return data;
};

// ─── Zone Assignments ─────────────────────────────────────────────────────

export const fetchMyZones = async (): Promise<ModeratorZone[]> => {
  const { data } = await api.get('/api/complaints/zone-assignments/my-zones/');
  return Array.isArray(data) ? data : data.results ?? [];
};

export const fetchZoneAssignments = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<ModeratorZone>> => {
  const { data } = await api.get('/api/complaints/zone-assignments/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

// ─── Vendors ──────────────────────────────────────────────────────────────

export const fetchModeratorVendors = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<ModeratorUser>> => {
  const { data } = await api.get('/api/users/moderator/vendors/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

export const suspendUser = async (userId: number, userType: 'vendors' | 'drivers') => {
  const { data } = await api.patch(`/api/users/moderator/${userType}/`, {
    user_id: userId, action: 'suspend',
  });
  return data;
};

export const activateUser = async (userId: number, userType: 'vendors' | 'drivers') => {
  const { data } = await api.patch(`/api/users/moderator/${userType}/`, {
    user_id: userId, action: 'activate',
  });
  return data;
};

// ─── Drivers ─────────────────────────────────────────────────────────────

export const fetchModeratorDrivers = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<ModeratorUser>> => {
  const { data } = await api.get('/api/users/moderator/drivers/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

// ─── Orders ──────────────────────────────────────────────────────────────

export const fetchModeratorOrders = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<any>> => {
  const { data } = await api.get('/api/orders/moderator/orders/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

// ─── Complaints ───────────────────────────────────────────────────────────

export const fetchComplaints = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<Complaint>> => {
  const { data } = await api.get('/api/complaints/complaints/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
};

export const fetchComplaint = async (id: number): Promise<Complaint> => {
  const { data } = await api.get<Complaint>(`/api/complaints/complaints/${id}/`);
  return data;
};

export const fetchComplaintStats = async (): Promise<ComplaintStats> => {
  const { data } = await api.get<ComplaintStats>('/api/complaints/complaints/stats/');
  return data;
};

export const updateComplaintStatus = async (
  id: number, status: string, note?: string
): Promise<Complaint> => {
  const { data } = await api.post<Complaint>(
    `/api/complaints/complaints/${id}/update-status/`,
    { status, note: note ?? '' }
  );
  return data;
};

export const setComplaintPriority = async (id: number, priority: string) => {
  const { data } = await api.post(`/api/complaints/complaints/${id}/set-priority/`, { priority });
  return data;
};

export const assignComplaint = async (id: number, moderatorId: number) => {
  const { data } = await api.post(`/api/complaints/complaints/${id}/assign/`, {
    moderator_id: moderatorId,
  });
  return data;
};

export const addComplaintNote = async (
  id: number, content: string, noteType?: string, isInternal?: boolean
) => {
  const { data } = await api.post(`/api/complaints/complaints/${id}/add-note/`, {
    content,
    note_type: noteType ?? 'MODERATOR',
    is_internal: isInternal ?? true,
  });
  return data;
};

export const requestEvidence = async (id: number) => {
  const { data } = await api.post(`/api/complaints/complaints/${id}/request-evidence/`);
  return data;
};

export const escalateComplaint = async (id: number, reason: string) => {
  const { data } = await api.post(`/api/complaints/complaints/${id}/escalate/`, { reason });
  return data;
};

export const saveInternalNotes = async (id: number, notes: string) => {
  const { data } = await api.post(`/api/complaints/complaints/${id}/internal-notes/`, { notes });
  return data;
};

// ─── Notifications to users ───────────────────────────────────────────────

export const sendNotificationToUser = async (
  userId: number, title: string, message: string
) => {
  // Uses the admin notification creation endpoint
  const { data } = await api.post('/api/notifications/alerts/', { user: userId, title, message });
  return data;
};

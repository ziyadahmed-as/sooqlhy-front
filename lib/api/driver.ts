// lib/api/driver.ts — Production Driver API (all URLs corrected to match backend routing)
import api from '@/lib/api/axios';
import type { PaginatedResponse } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DriverProfile {
  id: number;
  user: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  // Vehicle
  vehicle_type: 'MOTORCYCLE' | 'CAR' | 'VAN' | 'TRUCK' | 'BICYCLE';
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_color: string;
  plate_number: string;
  insurance_info: string;
  // License & Identity
  license_number: string;
  national_id: string;
  // Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  // Photo
  profile_photo: string | null;
  // Status
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'RESTING';
  delivery_status: 'IDLE' | 'TRAVELING_TO_VENDOR' | 'PICKED_UP' | 'OUT_FOR_DELIVERY';
  max_concurrent_deliveries: number;
  is_available: boolean;
  // Location
  latitude: string | null;
  longitude: string | null;
  location_updated_at: string | null;
  // Work preferences
  preferred_areas: string;
  working_days: string[];
  work_start_time: string | null;
  work_end_time: string | null;
  max_delivery_distance_km: number;
  // Timestamps
  created_at: string | null;
  updated_at: string;
}

export interface DriverStats {
  assigned: number;
  pending: number;
  accepted: number;
  in_transit: number;
  total_deliveries: number;
  today_deliveries: number;
  weekly_deliveries: number;
  monthly_deliveries: number;
  failed_deliveries: number;
  avg_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
  recent_reviews: RecentReview[];
  total_earnings: number;
  wallet_balance: number;
  today_earnings: number;
  weekly_earnings: number;
  monthly_earnings: number;
  on_time_rate: number;
  avg_delivery_time: string | null;
}

export interface RecentReview {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  buyer__first_name: string;
  buyer__last_name: string;
  order__id: number;
}

export interface DriverKycStatus {
  overall_status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  is_verified: boolean;
  required_documents: string[];
  approved_documents: string[];
  records: {
    id: string;
    kyc_type: string;
    status: string;
    submitted_at: string | null;
    rejection_reason: string;
  }[];
}

export interface DriverOrder {
  id: number;
  buyer: number;
  buyer_name: string;
  vendor: number;
  shipping_address: {
    street_address: string;
    city: string;
    state: string;
    country: string;
    latitude: string | null;
    longitude: string | null;
  } | null;
  status: string;
  total_amount: string;
  tracking_number: string | null;
  driver_assigned_at: string | null;
  estimated_delivery_date: string | null;
  delivered_at: string | null;
  delivery_attempts: number;
  customer_notes: string | null;
  items: {
    id: number;
    product: number;
    product_name: string;
    quantity: number;
    price_at_purchase: string;
  }[];
  tracking_history: {
    status: string;
    location_lat: string | null;
    location_long: string | null;
    timestamp: string;
    description: string;
  }[];
  delivery_rating: { rating: number; comment: string; created_at: string } | null;
  created_at: string;
}

export type RejectionReason = 'TOO_FAR' | 'VEHICLE_ISSUE' | 'BUSY' | 'PERSONAL' | 'OTHER';

export type DeliveryStatusUpdate =
  | 'TRAVELING_TO_VENDOR'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'CANCELLED';

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getDriverProfile = async (): Promise<DriverProfile> => {
  const { data } = await api.get<DriverProfile>('/api/users/driver-profile/me/');
  return data;
};

export const updateDriverProfile = async (
  payload: Partial<DriverProfile>
): Promise<DriverProfile> => {
  const { data } = await api.patch<DriverProfile>('/api/users/driver-profile/me/', payload);
  return data;
};

export const updateDriverProfilePhoto = async (file: File): Promise<DriverProfile> => {
  const form = new FormData();
  form.append('profile_photo', file);
  const { data } = await api.patch<DriverProfile>('/api/users/driver-profile/me/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ─── Availability & Location ──────────────────────────────────────────────────

export const toggleAvailability = async (): Promise<{ status: string }> => {
  const { data } = await api.post<{ status: string }>(
    '/api/users/driver-profile/toggle-availability/'
  );
  return data;
};

export const updateLocation = async (
  latitude: number,
  longitude: number
): Promise<{ latitude: string; longitude: string; location_updated_at: string }> => {
  const { data } = await api.post('/api/users/driver-profile/location/', { latitude, longitude });
  return data;
};

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getDriverStats = async (): Promise<DriverStats> => {
  const { data } = await api.get<DriverStats>('/api/users/driver-profile/stats/');
  return data;
};

// ─── KYC ─────────────────────────────────────────────────────────────────────

export const getDriverKycStatus = async (): Promise<DriverKycStatus> => {
  const { data } = await api.get<DriverKycStatus>('/api/users/driver-profile/kyc-status/');
  return data;
};

// ─── Assignments ─────────────────────────────────────────────────────────────

export const fetchDriverAssignments = async (): Promise<DriverOrder[]> => {
  const { data } = await api.get('/api/orders/driver/assignments/');
  return Array.isArray(data) ? data : (data as any).results ?? [];
};

export const acceptAssignment = async (orderId: number): Promise<DriverOrder> => {
  const { data } = await api.post<DriverOrder>(
    `/api/orders/driver/assignments/${orderId}/accept/`
  );
  return data;
};

export const rejectAssignment = async (
  orderId: number,
  rejection_reason: RejectionReason
): Promise<{ detail: string }> => {
  const { data } = await api.post<{ detail: string }>(
    `/api/orders/driver/assignments/${orderId}/reject/`,
    { rejection_reason }
  );
  return data;
};

// ─── Delivery Status Updates ──────────────────────────────────────────────────

export const updateDeliveryStatus = async (
  orderId: number,
  status: DeliveryStatusUpdate,
  options?: { latitude?: number; longitude?: number; description?: string }
): Promise<DriverOrder> => {
  const { data } = await api.post<DriverOrder>(
    `/api/orders/driver/order/${orderId}/status/`,
    { status, ...options }
  );
  return data;
};

export const uploadDeliveryProof = async (
  orderId: number,
  proofFile: File,
  signatureFile?: File
): Promise<{ detail: string }> => {
  const form = new FormData();
  form.append('proof', proofFile);
  if (signatureFile) form.append('signature', signatureFile);
  const { data } = await api.post(`/api/orders/driver/order/${orderId}/proof/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const submitDeliveryRating = async (
  orderId: number,
  rating: number,
  comment?: string
): Promise<{ detail: string; rating: number }> => {
  const { data } = await api.post(`/api/orders/driver/order/${orderId}/rate/`, {
    rating,
    comment: comment ?? '',
  });
  return data;
};

// ─── History & Earnings ───────────────────────────────────────────────────────

export const fetchDeliveryHistory = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<DriverOrder>> => {
  const { data } = await api.get('/api/users/driver-profile/delivery-history/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data as PaginatedResponse<DriverOrder>;
};

export const fetchEarningsHistory = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<any>> => {
  const { data } = await api.get('/api/users/driver-profile/earnings-history/', { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data as PaginatedResponse<any>;
};

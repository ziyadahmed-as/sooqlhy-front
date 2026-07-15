// lib/api/delivery.ts — Vendor delivery & driver assignment APIs
import api from './axios';
import type { PaginatedResponse } from '@/lib/types';

export interface DeliveryZone {
  id: number;
  name: string;
  country: string;
  region: string;
  city: string;
  district: string;
  is_active: boolean;
  created_at: string;
}

export interface AvailableDriver {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  vehicle_type: string;
  status: string;
  license_number: string;
  is_available: boolean;
}

export interface AssignDriverPayload {
  driver_id: number;
}

/** Fetch all active delivery zones */
export const fetchDeliveryZones = async (): Promise<DeliveryZone[]> => {
  const { data } = await api.get('/api/orders/zones/');
  return Array.isArray(data) ? data : data.results ?? [];
};

/** Fetch available, verified drivers optionally filtered by location */
export const fetchAvailableDrivers = async (params?: {
  country?: string;
  city?: string;
}): Promise<AvailableDriver[]> => {
  const { data } = await api.get('/api/orders/vendor-orders/available_drivers/', { params });
  return Array.isArray(data) ? data : data.results ?? [];
};

/** Assign a driver to a vendor order */
export const assignDriver = async (
  orderId: string | number,
  payload: AssignDriverPayload
): Promise<unknown> => {
  const { data } = await api.post(`/api/orders/vendor-orders/${orderId}/assign_driver/`, payload);
  return data;
};

/** Reassign a different driver to an order */
export const reassignDriver = async (
  orderId: string | number,
  payload: AssignDriverPayload
): Promise<unknown> => {
  const { data } = await api.post(`/api/orders/vendor-orders/${orderId}/reassign_driver/`, payload);
  return data;
};

/** Fetch delivery-related orders for a vendor (active, in-transit) */
export const fetchActiveDeliveries = async (): Promise<unknown[]> => {
  const { data } = await api.get('/api/orders/vendor-orders/', {
    params: { status: 'SHIPPED' },
  });
  if (Array.isArray(data)) return data;
  return (data as PaginatedResponse<unknown>).results ?? [];
};

/** Fetch delivery history (completed orders) */
export const fetchDeliveryHistory = async (params?: Record<string, string | number>): Promise<PaginatedResponse<unknown>> => {
  const { data } = await api.get('/api/orders/vendor-orders/', {
    params: { status: 'DELIVERED', ...params },
  });
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  return data as PaginatedResponse<unknown>;
};

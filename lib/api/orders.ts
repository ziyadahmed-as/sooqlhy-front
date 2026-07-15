// lib/api/orders.ts
import api from '@/lib/api/axios';
import type { Order, PaginatedResponse, VendorOrder } from '@/lib/types';

// ── Vendor Stats shape matching backend vendor_stats action ──────────────────
export interface BackendVendorStats {
  total_sales: number;
  order_count: number;
  pending_count: number;
  low_stock_count: number;
  sales_history: { name: string; sales: number }[];
}

/**
 * Fetch paginated orders for the current buyer.
 * Backend: GET /api/orders/my-orders/
 */
export const fetchBuyerOrders = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<Order>> => {
  const { data } = await api.get<PaginatedResponse<Order>>('/api/orders/my-orders/', { params });
  // Guard: backend may return plain array before pagination is applied
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  return data;
};

/**
 * Fetch a single order by ID.
 * Backend: GET /api/orders/my-orders/{id}/
 */
export const fetchOrderDetail = async (id: string): Promise<Order> => {
  const { data } = await api.get<Order>(`/api/orders/my-orders/${id}/`);
  return data;
};

/**
 * Cancel a buyer's own order.
 * Backend: POST /api/orders/my-orders/{id}/cancel/
 */
export const cancelOrder = async (id: string): Promise<Order> => {
  const { data } = await api.post<Order>(`/api/orders/my-orders/${id}/cancel/`);
  return data;
};

/**
 * Fetch orders for the vendor dashboard.
 * Backend: GET /api/orders/vendor-orders/  (alias for my-orders/vendor_orders/)
 */
export const fetchVendorOrders = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<VendorOrder>> => {
  const { data } = await api.get('/api/orders/vendor-orders/', { params });
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  return data as PaginatedResponse<VendorOrder>;
};

/**
 * Fetch aggregated vendor stats.
 * Backend: GET /api/orders/my-orders/vendor_stats/
 */
export const fetchVendorStats = async (): Promise<BackendVendorStats> => {
  const { data } = await api.get<BackendVendorStats>('/api/orders/my-orders/vendor_stats/');
  return data;
};

/**
 * Update order status (vendor action).
 * Backend: POST /api/orders/vendor-orders/{id}/update_status/
 */
export const updateOrderStatus = async (id: string, status: string, reason?: string): Promise<Order> => {
  const { data } = await api.post<Order>(`/api/orders/vendor-orders/${id}/update_status/`, {
    status,
    reason: reason ?? '',
  });
  return data;
};

/**
 * Checkout — converts cart to order(s).
 * Backend: POST /api/orders/my-orders/checkout/
 */
export const checkout = async (payload?: {
  currency?: string;
  payment_gateway?: string;
}): Promise<Order[]> => {
  const { data } = await api.post<Order[]>('/api/orders/my-orders/checkout/', payload ?? {});
  return Array.isArray(data) ? data : [data];
};

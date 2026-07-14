// lib/api/orders.ts
import api from '@/lib/api/axios';
import type { Order, PaginatedResponse, VendorOrder, VendorStats } from '@/lib/types';

/** Fetch paginated orders for the current buyer */
export const fetchBuyerOrders = async (params?: Record<string, string | number>): Promise<PaginatedResponse<Order>> => {
  const { data } = await api.get<PaginatedResponse<Order>>('/api/orders/my-orders/', { params });
  return data;
};

/** Fetch a single order by ID */
export const fetchOrderDetail = async (id: string): Promise<Order> => {
  const { data } = await api.get<Order>(`/api/orders/my-orders/${id}/`);
  return data;
};

/** Fetch orders for the vendor dashboard */
export const fetchVendorOrders = async (params?: Record<string, string | number>): Promise<PaginatedResponse<VendorOrder>> => {
  const { data } = await api.get<PaginatedResponse<VendorOrder>>('/api/orders/vendor-orders/', { params });
  return data;
};

/** Fetch aggregated vendor stats */
export const fetchVendorStats = async (): Promise<VendorStats> => {
  const { data } = await api.get<VendorStats>('/api/orders/my-orders/vendor_stats/');
  return data;
};

/** Update order status (vendor action) */
export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const { data } = await api.patch<Order>(`/api/orders/vendor-orders/${id}/`, { status });
  return data;
};

/** Cancel an order (buyer action) */
export const cancelOrder = async (id: string): Promise<Order> => {
  const { data } = await api.post<Order>(`/api/orders/my-orders/${id}/cancel/`);
  return data;
};

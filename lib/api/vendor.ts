// lib/api/vendor.ts
import api from '@/lib/api/axios';
import type { VendorStats, VendorProduct, Category, PaginatedResponse } from '@/lib/types';

// Re-export analytics helpers for backwards compatibility
export { fetchVendorAnalytics, exportVendorAnalytics } from './analytics';

/** Fetch aggregated statistics for the logged-in vendor */
export const fetchVendorStats = async (): Promise<VendorStats> => {
  const { data } = await api.get<VendorStats>('/api/orders/my-orders/vendor_stats/');
  return data;
};

/** Fetch low-stock products for the vendor */
export const fetchLowStockProducts = async (): Promise<VendorProduct[]> => {
  const { data } = await api.get<VendorProduct[]>('/api/products/low_stock/');
  return Array.isArray(data) ? data : (data as any).results ?? [];
};

/** Fetch products for the logged-in vendor */
export const fetchVendorProducts = async (params?: Record<string, string | number>): Promise<VendorProduct[]> => {
  const { data } = await api.get<VendorProduct[] | PaginatedResponse<VendorProduct>>('/api/products/my_products/', { params });
  return Array.isArray(data) ? data : (data as PaginatedResponse<VendorProduct>).results ?? [];
};

/** Fetch all product categories */
export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[] | PaginatedResponse<Category>>('/api/products/categories/');
  return Array.isArray(data) ? data : (data as PaginatedResponse<Category>).results ?? [];
};

/** Fetch a single product's details for editing */
export const fetchProductDetails = async (id: string): Promise<VendorProduct> => {
  const { data } = await api.get<VendorProduct>(`/api/products/${id}/`);
  return data;
};

/** Create a new product (multipart/form-data for image uploads) */
export const createVendorProduct = async (formData: FormData): Promise<VendorProduct> => {
  const { data } = await api.post<VendorProduct>('/api/products/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/** Update an existing product */
export const updateVendorProduct = async (id: string, formData: FormData): Promise<VendorProduct> => {
  const { data } = await api.patch<VendorProduct>(`/api/products/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/** Submit a product for moderation review */
export const submitProductForReview = async (id: string): Promise<{ status: string; message: string }> => {
  const { data } = await api.post<{ status: string; message: string }>(`/api/products/${id}/submit_for_review/`);
  return data;
};

/** Delete a vendor product */
export const deleteVendorProduct = async (id: string): Promise<void> => {
  await api.delete(`/api/products/${id}/`);
};

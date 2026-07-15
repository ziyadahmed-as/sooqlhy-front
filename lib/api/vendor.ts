// lib/api/vendor.ts
import api from '@/lib/api/axios';
import type { VendorStats, VendorProduct, Category, PaginatedResponse } from '@/lib/types';

// Re-export analytics helpers for backwards compatibility
export { fetchVendorAnalytics, exportVendorAnalytics } from './analytics';

// ─── Vendor Stats ──────────────────────────────────────────────────────────────

/** Aggregated order-based stats for the logged-in vendor */
export const fetchVendorStats = async (): Promise<VendorStats> => {
  const { data } = await api.get<VendorStats>('/api/orders/my-orders/vendor_stats/');
  return data;
};

/** Aggregated product-level stats (totals, pending, low-stock, etc.) */
export interface VendorProductStats {
  total: number;
  active: number;
  pending: number;
  out_of_stock: number;
  low_stock: number;
  draft: number;
  rejected: number;
}

export const fetchVendorProductStats = async (): Promise<VendorProductStats> => {
  const { data } = await api.get<VendorProductStats>('/api/products/product/stats/');
  return data;
};

// ─── Products ──────────────────────────────────────────────────────────────────

/** Fetch products for the logged-in vendor (all statuses) */
export const fetchVendorProducts = async (
  params?: Record<string, string | number>
): Promise<VendorProduct[]> => {
  const { data } = await api.get<VendorProduct[] | PaginatedResponse<VendorProduct>>(
    '/api/products/product/my_products/',
    { params }
  );
  return Array.isArray(data) ? data : (data as PaginatedResponse<VendorProduct>).results ?? [];
};

/** Fetch low-stock products for the vendor */
export const fetchLowStockProducts = async (): Promise<VendorProduct[]> => {
  const { data } = await api.get<VendorProduct[] | PaginatedResponse<VendorProduct>>(
    '/api/products/product/low_stock/'
  );
  return Array.isArray(data) ? data : (data as any).results ?? [];
};

/** Fetch all product categories (public) */
export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[] | PaginatedResponse<Category>>(
    '/api/products/categories/'
  );
  return Array.isArray(data) ? data : (data as PaginatedResponse<Category>).results ?? [];
};

/** Fetch a single product's details for editing */
export const fetchProductDetails = async (id: string): Promise<VendorProduct> => {
  const { data } = await api.get<VendorProduct>(`/api/products/product/${id}/`);
  return data;
};

/** Create a new product (multipart/form-data for image uploads) */
export const createVendorProduct = async (formData: FormData): Promise<VendorProduct> => {
  const { data } = await api.post<VendorProduct>('/api/products/product/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/** Update an existing product */
export const updateVendorProduct = async (
  id: string,
  formData: FormData
): Promise<VendorProduct> => {
  const { data } = await api.patch<VendorProduct>(`/api/products/product/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/** Submit a product for moderation review */
export const submitProductForReview = async (
  id: string
): Promise<{ status: string; message: string }> => {
  const { data } = await api.post<{ status: string; message: string }>(
    `/api/products/product/${id}/submit_for_review/`
  );
  return data;
};

/** Delete a vendor product */
export const deleteVendorProduct = async (id: string): Promise<void> => {
  await api.delete(`/api/products/product/${id}/`);
};

// ─── KYC Status ────────────────────────────────────────────────────────────────

export interface VendorKycStatus {
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  rejection_reason?: string;
  submitted_at?: string;
  kyc_type?: string;
}

/** Fetch the current vendor's latest KYC record */
export const fetchMyKycStatus = async (): Promise<VendorKycStatus> => {
  try {
    const { data } = await api.get('/api/kyc/records/');
    const records = Array.isArray(data) ? data : data.results ?? [];
    if (records.length === 0) return { status: 'NOT_SUBMITTED' };
    // Return the most recent record
    const latest = records[0];
    return {
      status: latest.status,
      rejection_reason: latest.rejection_reason ?? latest.latest_review?.rejection_reason,
      submitted_at: latest.submitted_at,
      kyc_type: latest.kyc_type,
    };
  } catch {
    return { status: 'NOT_SUBMITTED' };
  }
};

import axios from '@/lib/api/axios';
import type { VendorStats, VendorProduct } from '@/lib/types';

/** Fetch aggregated statistics for the logged‑in vendor. */
export async function fetchVendorStats(): Promise<VendorStats> {
  const { data } = await axios.get<VendorStats>('/api/orders/my-orders/vendor_stats/');
  return data;
}

/** Fetch low‑stock products for the vendor. */
export async function fetchLowStockProducts(): Promise<VendorProduct[]> {
  const { data } = await axios.get<VendorProduct[]>('/api/orders/my-orders/low_stock/');
  return data;
}

/** Fetch products for the vendor. */
export async function fetchVendorProducts(): Promise<VendorProduct[]> {
  const response = await axios.get<VendorProduct[]>('/api/orders/my-orders/vendor_products/');
  return response.data;
}

/** Fetch all products belonging to the logged‑in vendor. */
export async function fetchAllVendorProducts(): Promise<VendorProduct[]> {
  const { data } = await axios.get<VendorProduct[]>('/api/vendor/products/');
  return data;
}

/** Fetch comprehensive vendor analytics data. */
export async function fetchVendorAnalytics(): Promise<import('@/lib/types').AnalyticsData> {
  const { data } = await axios.get<import('@/lib/types').AnalyticsData>('/api/analytics/vendor/');
  return data;
}

/** Export vendor analytics data. */
export async function exportVendorAnalytics(format: 'csv' | 'pdf'): Promise<void> {
  const response = await axios.get(`/api/analytics/vendor/export/?format=${format}`, {
    responseType: 'blob', // Important for file downloads
  });
  
  // Create a blob from the response data
  const blob = new Blob([response.data], { 
    type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
  });
  
  // Create a link element, set its href to the blob, and trigger a download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `vendor_analytics.${format}`);
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/** Fetch a single product's details for editing. */
export async function fetchProductDetails(id: string): Promise<VendorProduct> {
  const { data } = await axios.get<VendorProduct>(`/api/products/${id}/`);
  return data;
}

/** Fetch all product categories. */
export async function fetchCategories(): Promise<import('@/lib/types').Category[]> {
  const { data } = await axios.get<import('@/lib/types').Category[]>('/api/products/categories/');
  return data;
}

/** Create a new product. */
export async function createVendorProduct(formData: FormData): Promise<VendorProduct> {
  // Use multipart/form-data for image uploads
  const { data } = await axios.post<VendorProduct>('/api/products/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Update an existing product. */
export async function updateVendorProduct(id: string, formData: FormData): Promise<VendorProduct> {
  const { data } = await axios.patch<VendorProduct>(`/api/products/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Submit a product for review. */
export async function submitProductForReview(id: string): Promise<{ status: string, message: string }> {
  const { data } = await axios.post<{ status: string, message: string }>(`/api/products/${id}/submit_for_review/`);
  return data;
}

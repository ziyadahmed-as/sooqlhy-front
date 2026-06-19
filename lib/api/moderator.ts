import axios from '@/lib/api/axios';
import type { Product } from '@/lib/types';

/** Fetch all products in the moderation queue (SUBMITTED or UNDER_REVIEW). */
export async function fetchModerationQueue(): Promise<Product[]> {
  const { data } = await axios.get<Product[]>('/api/products/moderation/');
  return data;
}

/** Approve a single product. */
export async function approveProduct(id: string): Promise<{ status: string }> {
  const { data } = await axios.post<{ status: string }>(`/api/products/moderation/${id}/approve/`);
  return data;
}

/** Reject a single product with a reason. */
export async function rejectProduct(id: string, reason: string): Promise<{ status: string, reason: string }> {
  const { data } = await axios.post<{ status: string, reason: string }>(`/api/products/moderation/${id}/reject/`, { reason });
  return data;
}

/** Bulk approve multiple products. */
export async function bulkApproveProducts(productIds: string[]): Promise<{ status: string, count: number }> {
  const { data } = await axios.post<{ status: string, count: number }>('/api/products/moderation/bulk_approve/', { product_ids: productIds });
  return data;
}

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

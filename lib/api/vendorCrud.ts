import axios from '@/lib/api/axios';
import type { VendorProduct } from '@/lib/types';

/** Create a new vendor product */
export async function createVendorProduct(payload: Partial<VendorProduct>): Promise<VendorProduct> {
  const { data } = await axios.post<VendorProduct>('/api/vendor/products/', payload);
  return data;
}

/** Update an existing vendor product */
export async function updateVendorProduct(id: string, payload: Partial<VendorProduct>): Promise<VendorProduct> {
  const { data } = await axios.patch<VendorProduct>(`/api/vendor/products/${id}/`, payload);
  return data;
}

/** Delete a vendor product */
export async function deleteVendorProduct(id: string): Promise<void> {
  await axios.delete(`/api/vendor/products/${id}/`);
}

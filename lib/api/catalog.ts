// lib/api/catalog.ts
import api from '@/lib/api/axios';
import type { Product, Category, PaginatedResponse } from '@/lib/types';

/** Fetch paginated product catalog with optional filters */
export const fetchCatalog = async (params: Record<string, string | number>): Promise<PaginatedResponse<Product>> => {
  const { data } = await api.get<PaginatedResponse<Product>>('/api/product/', { params });
  // Guard: some endpoints may return a plain array
  if (Array.isArray(data)) {
    return { count: (data as Product[]).length, next: null, previous: null, results: data as Product[] };
  }
  return data;
};

/** Fetch list of product categories */
export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/api/products/categories/');
  return Array.isArray(data) ? data : data.results ?? [];
};

/** Fetch detailed info for a single product */
export const fetchProductDetail = async (id: string): Promise<Product> => {
  const { data } = await api.get<Product>(`/api/products/catalog/${id}/`);
  return data;
};

/** Add a product (optionally with a variant) to the backend cart */
export const addToCart = async (payload: { product_id: string; variant_id?: string; quantity?: number }): Promise<unknown> => {
  const { data } = await api.post('/api/orders/cart/add_item/', payload);
  return data;
};

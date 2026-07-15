// lib/api/catalog.ts
import api from '@/lib/api/axios';
import type { Product, Category, PaginatedResponse } from '@/lib/types';

export interface CatalogParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string | number;
  category_id?: string | number;
  vendor?: string | number;
  min_price?: number;
  max_price?: number;
  rating?: number;
  min_rating?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  ordering?: string;
  tags?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Fetch paginated product catalog with filters.
 * Backend: GET /api/products/product/
 */
export const fetchCatalog = async (
  params: CatalogParams
): Promise<PaginatedResponse<Product>> => {
  // Strip undefined values so they're not sent as "undefined" strings
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  );
  const { data } = await api.get<PaginatedResponse<Product>>('/api/products/product/', { params: clean });
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  return data;
};

/**
 * Fetch list of product categories.
 * Backend: GET /api/products/categories/
 */
export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/api/products/categories/');
  return Array.isArray(data) ? data : data.results ?? [];
};

/**
 * Fetch detailed info for a single product.
 * Backend: GET /api/products/product/{id}/
 */
export const fetchProductDetail = async (id: string): Promise<Product> => {
  const { data } = await api.get<Product>(`/api/products/product/${id}/`);
  return data;
};

/**
 * Fetch reviews for a product.
 * Backend: GET /api/products/reviews/?product={id}
 */
export const fetchProductReviews = async (productId: string) => {
  const { data } = await api.get('/api/products/reviews/', { params: { product: productId } });
  return Array.isArray(data) ? data : data.results ?? [];
};

/**
 * Add a product to the backend cart.
 * Backend: POST /api/orders/cart/add_item/
 */
export const addToCart = async (payload: {
  product_id: string;
  variant_id?: string;
  quantity?: number;
}): Promise<unknown> => {
  const { data } = await api.post('/api/orders/cart/add_item/', payload);
  return data;
};

/**
 * Fetch the backend cart.
 * Backend: GET /api/orders/cart/
 */
export const fetchCart = async () => {
  const { data } = await api.get('/api/orders/cart/');
  return data;
};

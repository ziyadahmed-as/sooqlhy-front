import api from '@/lib/api/axios';
import { Product, Category } from '@/lib/types';

/** Fetch product catalog with optional filters */
export const fetchCatalog = async (params: Record<string, any>) => {
  const response = await api.get('/api/product/', { params });
  return response.data; // expected { results: Product[], count: number }
};

/** Fetch list of product categories */
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get('/api/products/categories/');
  return response.data;
};

/** Fetch detailed info for a single product */
export const fetchProductDetail = async (id: string) => {
  const response = await api.get(`/api/products/product/${id}/`);
  return response.data as Product & {
    description: string;
    stock: number;
    variants: { id: string; name: string; options: string[] }[];
    reviews: { id: string; user: { id: string; name: string }; rating: number; comment: string; created_at: string }[];
  };
};

/** Add a product (optionally with a variant) to the cart */
export const addToCart = async (payload: { product_id: string; variant_id?: string; quantity?: number }) => {
  const response = await api.post('/api/orders/cart/add_item/', payload);
  return response.data;
};

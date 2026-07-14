// lib/api/search.ts
import api from './axios';
import type { Product } from '@/lib/types';

export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data } = await api.get(`/api/search/?q=${encodeURIComponent(query)}`);
  return Array.isArray(data) ? data : data.results ?? [];
};

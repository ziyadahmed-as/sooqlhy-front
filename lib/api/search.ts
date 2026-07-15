// lib/api/search.ts
import api from './axios';
import type { Product } from '@/lib/types';

export interface SearchSuggestion {
  query: string;
  type: 'product' | 'category' | 'brand';
}

export const searchProducts = async (
  query: string,
  params?: Record<string, string | number>
): Promise<Product[]> => {
  const { data } = await api.get(`/api/search/`, { params: { q: query, ...params } });
  return Array.isArray(data) ? data : data.results ?? [];
};

export const fetchSearchSuggestions = async (query: string): Promise<string[]> => {
  try {
    const { data } = await api.get('/api/search/suggestions/', { params: { q: query } });
    return Array.isArray(data) ? data : data.results ?? [];
  } catch {
    return [];
  }
};

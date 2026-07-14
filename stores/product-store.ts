// stores/product-store.ts
import { create } from 'zustand';
import api from '@/lib/api/axios';
import type { Product, Category } from '@/lib/types';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: Record<string, string>) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  featuredProducts: [],
  categories: [],
  loading: false,
  error: null,

  async fetchProducts(params) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/api/product/', { params });
      const list: Product[] = Array.isArray(data) ? data : data.results ?? [];
      set({ products: list, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as any)?.response?.data?.detail || 'Failed to load products',
        loading: false,
      });
    }
  },

  async fetchFeaturedProducts() {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/api/product/', {
        params: { is_featured: 'true' },
      });
      const list: Product[] = Array.isArray(data) ? data : data.results ?? [];
      set({ featuredProducts: list, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as any)?.response?.data?.detail || 'Failed to load featured products',
        loading: false,
      });
    }
  },

  async fetchCategories() {
    try {
      const { data } = await api.get('/api/products/categories/');
      const list: Category[] = Array.isArray(data) ? data : data.results ?? [];
      set({ categories: list });
    } catch {
      // Categories are non-critical – silently ignore
    }
  },
}));

import { create } from 'zustand';
import api from '@/lib/api/axios';
import { Product } from '@/lib/types';

type ProductState = {
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: Record<string, string>) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  image: string | null;
};

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  featuredProducts: [],
  categories: [],
  loading: false,
  error: null,

  async fetchProducts(params) {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/products/catalog/', { params });
      // DRF may return paginated { results: [...] } or a plain array
      const data = response.data;
      const list = Array.isArray(data) ? data : data.results ?? [];
      set({ products: list, loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.detail || 'Failed to load products',
        loading: false,
      });
    }
  },

  async fetchFeaturedProducts() {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/products/catalog/', {
        params: { is_featured: 'true' },
      });
      const data = response.data;
      const list = Array.isArray(data) ? data : data.results ?? [];
      set({ featuredProducts: list, loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.detail || 'Failed to load featured products',
        loading: false,
      });
    }
  },

  async fetchCategories() {
    try {
      const response = await api.get('/api/products/categories/');
      const data = response.data;
      const list = Array.isArray(data) ? data : data.results ?? [];
      set({ categories: list });
    } catch {
      // Categories are non-critical – silently ignore
    }
  },
}));

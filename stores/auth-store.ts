// stores/auth-store.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '@/lib/api/axios';
import { User, Role } from '@/lib/types';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,
      async login(email, password) {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.post('/api/auth/login/', { email, password });
          const { access, refresh, user } = response.data;
          set({ accessToken: access, refreshToken: refresh, user, loading: false });
        } catch (err: any) {
          set({ error: err?.response?.data?.detail || 'Login failed', loading: false });
        }
      },
      logout() {
        // clear cookies & store
        set({ user: null, accessToken: null, refreshToken: null, loading: false, error: null });
      },
      setUser(user) {
        set({ user });
      },
      setTokens(accessToken, refreshToken) {
        set({ accessToken, refreshToken });
      },
    }),
    {
      name: 'auth-storage', // key in storage
      getStorage: () => localStorage,
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api/axios';
import { User } from '@/lib/types';
import Cookies from 'js-cookie';

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;            // 'BUYER' | 'VENDOR' | 'DRIVER'
  phone_number?: string;
  store_name?: string;     // required when role === 'VENDOR'
  vehicle_type?: string;   // optional when role === 'DRIVER'
  license_number?: string; // optional when role === 'DRIVER'
}

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (old_password: string, new_password: string) => Promise<void>;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: Cookies.get('refreshToken') || null,
      loading: false,
      error: null,

      async login(email: string, password: string) {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/api/auth/login/', { email, password });
          const { access, refresh, user } = response.data;
          set({ accessToken: access, refreshToken: refresh, user, loading: false });
          Cookies.set('access_token', access, { secure: true, sameSite: 'strict' });
          Cookies.set('refreshToken', refresh, { secure: true, sameSite: 'strict' });
        } catch (err: unknown) {
          set({
            error: (err as any)?.response?.data?.detail || 'Invalid email or password',
            loading: false,
          });
        }
      },

      async register(data: RegisterPayload) {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/api/users/register/', data);
          // Backend returns user fields + access + refresh tokens on 201
          const { access, refresh, ...userData } = response.data;
          if (access && refresh) {
            set({
              accessToken: access,
              refreshToken: refresh,
              user: userData as User,
              loading: false,
            });
            Cookies.set('access_token', access, { secure: true, sameSite: 'strict' });
            Cookies.set('refreshToken', refresh, { secure: true, sameSite: 'strict' });
          } else {
            set({ loading: false });
          }
        } catch (err: unknown) {
          const errData = (err as any)?.response?.data;
          let detail: string;
          if (typeof errData === 'object' && errData !== null) {
            detail = Object.entries(errData)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ');
          } else {
            detail = 'Registration failed';
          }
          set({ error: detail, loading: false });
          throw err;
        }
      },

      async logout() {
        const refreshToken = get().refreshToken || Cookies.get('refreshToken');
        try {
          if (refreshToken) {
            await api.post('/api/auth/logout/', { refresh: refreshToken });
          }
        } catch {
          // Even if blacklist fails, clear local state
        } finally {
          set({ user: null, accessToken: null, refreshToken: null, loading: false, error: null });
          Cookies.remove('access_token');
          Cookies.remove('refreshToken');
        }
      },

      async changePassword(old_password: string, new_password: string) {
        set({ loading: true, error: null });
        try {
          await api.post('/api/users/users/change-password/', { old_password, new_password });
          set({ loading: false });
        } catch (err: unknown) {
          const detail =
            (err as any)?.response?.data?.old_password?.[0] ||
            (err as any)?.response?.data?.detail ||
            'Password change failed';
          set({ error: detail, loading: false });
          throw err;
        }
      },

      clearAuth() {
        set({ user: null, accessToken: null, refreshToken: null, loading: false, error: null });
        Cookies.remove('access_token');
        Cookies.remove('refreshToken');
      },

      setUser(user: User | null) {
        set({ user });
      },

      setTokens(accessToken: string | null, refreshToken: string | null) {
        set({ accessToken, refreshToken });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

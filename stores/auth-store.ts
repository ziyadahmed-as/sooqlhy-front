import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api/axios';
import { User } from '@/lib/types';
import Cookies from 'js-cookie';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string }) => Promise<void>;
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
      refreshToken: null,
      loading: false,
      error: null,
      async login(email: string, password: string) {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/api/auth/login/', { email, password });
          const { access, refresh, user } = response.data;
          set({ accessToken: access, refreshToken: refresh, user, loading: false });
          Cookies.set('refreshToken', refresh, { secure: true, sameSite: 'strict' });
        } catch (err: any) {
          set({ error: err?.response?.data?.detail || 'Login failed', loading: false });
        }
      },
      async register({ email, password }: { email: string; password: string }) {
        set({ loading: true, error: null });
        try {
          await api.post('/api/users/register/', {
            email,
            password,
          });
          set({ loading: false });
        } catch (err: any) {
          const errMsg = err?.response?.data;
          // Flatten error object for better display if it's an object
          const detail = typeof errMsg === 'object' && errMsg !== null 
            ? Object.values(errMsg).flat().join(', ') 
            : 'Registration failed';
          set({ error: detail || 'Registration failed', loading: false });
          throw err;
        }
      },
      async logout() {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await api.post('/api/auth/logout/', { refresh: refreshToken });
          }
        } catch {
          // Even if blacklist fails, clear local state
        } finally {
          set({ user: null, accessToken: null, refreshToken: null, loading: false, error: null });
          Cookies.remove('refreshToken');
        }
      },
      async changePassword(old_password: string, new_password: string) {
        set({ loading: true, error: null });
        try {
          await api.post('/api/users/change-password/', { old_password, new_password });
          set({ loading: false });
        } catch (err: any) {
          const detail = err?.response?.data?.old_password?.[0] || err?.response?.data?.detail || 'Password change failed';
          set({ error: detail, loading: false });
          throw err;
        }
      },
      clearAuth() {
        set({ user: null, accessToken: null, refreshToken: null, loading: false, error: null });
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
    }
  )
);

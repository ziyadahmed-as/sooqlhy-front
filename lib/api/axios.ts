import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Base API URL – should be set via NEXT_PUBLIC_API_URL in .env.local
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

/**
 * Create an Axios instance with base URL and JSON handling.
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor – inject Authorization header from auth store.
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers = config.headers ?? {} as any;
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Response interceptor – handle 401 (unauthorized) by attempting token refresh.
 * If refresh succeeds, retry the original request.
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) throw new Error('No refresh token');
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/token/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const newAccess: string = refreshResponse.data.access;
        // ROTATE_REFRESH_TOKENS=True → backend always returns a new refresh token.
        // If we discard it the next refresh will use the blacklisted old one → 401.
        const newRefresh: string = refreshResponse.data.refresh ?? refreshToken;

        // Persist both tokens in the store and cookies
        useAuthStore.getState().setTokens(newAccess, newRefresh);
        Cookies.set('access_token', newAccess, { secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', newRefresh, { secure: true, sameSite: 'strict' });

        // Retry the original request with the fresh access token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed – clear all auth state and cookies so the middleware
        // redirects the user to login on the next navigation.
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

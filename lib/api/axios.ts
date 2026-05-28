import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { getAuthStore } from '../stores/auth-store';

/**
 * Base API URL – should be set via NEXT_PUBLIC_API_URL in .env.local
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

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
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const { accessToken } = getAuthStore.getState();
  if (accessToken) {
    config.headers = config.headers ?? {};
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
        const { refreshToken } = getAuthStore.getState();
        if (!refreshToken) throw new Error('No refresh token');
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/token/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const newAccess = refreshResponse.data.access;
        // Update store
        getAuthStore.getState().setTokens({ accessToken: newAccess, refreshToken });
        // Set new header and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed – clear auth and redirect to login (handled by middleware on next request)
        getAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

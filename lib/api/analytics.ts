// lib/api/analytics.ts
import api from './axios';
import type { DailyAnalytics, AnalyticsData } from '@/lib/types';

/** Fetch daily platform analytics (admin only) */
export const fetchDailyAnalytics = async (): Promise<DailyAnalytics[]> => {
  const { data } = await api.get<DailyAnalytics[]>('/api/analytics/daily/');
  return Array.isArray(data) ? data : (data as any).results ?? [];
};

/** Fetch comprehensive vendor analytics for the logged-in vendor */
export const fetchVendorAnalytics = async (): Promise<AnalyticsData> => {
  const { data } = await api.get<AnalyticsData>('/api/analytics/vendor/');
  return data;
};

/** Export vendor analytics as CSV or PDF */
export const exportVendorAnalytics = async (format: 'csv' | 'pdf'): Promise<void> => {
  const response = await api.get(`/api/analytics/vendor/export/?format=${format}`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], {
    type: format === 'pdf' ? 'application/pdf' : 'text/csv',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `vendor_analytics.${format}`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// lib/api/notifications.ts
import api from './axios';
import type { Notification, PaginatedResponse } from '@/lib/types';

export const fetchNotifications = async (params?: { is_read?: boolean }): Promise<Notification[]> => {
  const { data } = await api.get<Notification[] | PaginatedResponse<Notification>>('/api/notifications/alerts/', { params });
  return Array.isArray(data) ? data : data.results ?? [];
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.post('/api/notifications/alerts/mark_all_read/');
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.patch(`/api/notifications/alerts/${id}/`, { is_read: true });
};

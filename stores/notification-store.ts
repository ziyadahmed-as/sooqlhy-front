// stores/notification-store.ts
import { create } from 'zustand';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api/notifications';
import type { Notification } from '@/lib/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markOneRead: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  loadNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchNotifications();
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.is_read).length,
        loading: false,
      });
    } catch (err: unknown) {
      set({
        error: (err as any)?.message || 'Failed to load notifications',
        loading: false,
      });
    }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (err: unknown) {
      set({ error: (err as any)?.message || 'Failed to mark notifications as read' });
    }
  },

  markOneRead: async (id: number) => {
    try {
      await markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // silently ignore
    }
  },
}));

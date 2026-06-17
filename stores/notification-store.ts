import { create } from 'zustand';
import { fetchNotifications, markAllNotificationsRead, Notification } from '@/lib/api/notifications';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loadNotifications: () => Promise<void>;
    markAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    
    loadNotifications: async () => {
        try {
            const data = await fetchNotifications();
            set({ 
                notifications: data,
                unreadCount: data.filter(n => !n.is_read).length
            });
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    },

    markAsRead: async () => {
        try {
            await markAllNotificationsRead();
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    }
}));

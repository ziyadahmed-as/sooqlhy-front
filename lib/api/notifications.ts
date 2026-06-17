import api from './axios';

export interface Notification {
    id: number;
    user: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
    const response = await api.get('/api/notifications/alerts/');
    return response.data;
};

export const markAllNotificationsRead = async (): Promise<void> => {
    await api.post('/api/notifications/alerts/mark_all_read/');
};

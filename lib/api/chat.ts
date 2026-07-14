import api from './axios';

export interface ChatRoom {
    id: string;
    buyer: number;
    seller: number;
    buyer_username?: string;
    seller_username?: string;
    product_id: string | null;
    created_at: string;
    unread_count: number;
    last_message?: Message;
}

export interface Message {
    id: number;
    room: string;
    sender: number | string;
    text: string;
    is_read: boolean;
    created_at: string;
}

export const fetchRooms = async (): Promise<ChatRoom[]> => {
    const response = await api.get('/api/chat/rooms/');
    return response.data;
};

export const fetchMessages = async (roomId: string): Promise<Message[]> => {
    const response = await api.get(`/api/chat/messages/?room=${roomId}`);
    return response.data;
};

export const sendMessage = async (roomId: string, data: { text: string }): Promise<Message> => {
    const response = await api.post(`/api/chat/rooms/${roomId}/messages/`, data);
    return response.data;
};

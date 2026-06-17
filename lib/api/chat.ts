import api from './axios';

export interface ChatRoom {
    id: string;
    buyer: number;
    seller: number;
    product_id: string | null;
    created_at: string;
    unread_count: number;
    last_message?: Message;
}

export interface Message {
    id: number;
    room: string;
    sender: number;
    text: string;
    is_read: boolean;
    created_at: string;
}

export const fetchRooms = async (): Promise<ChatRoom[]> => {
    const response = await api.get('/api/chat/rooms/');
    return response.data;
};

export const fetchMessages = async (): Promise<Message[]> => {
    const response = await api.get('/api/chat/messages/');
    return response.data;
};

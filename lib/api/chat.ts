// lib/api/chat.ts
import api from './axios';
import type { ChatRoom, ChatMessage } from '@/lib/types';

export const fetchRooms = async (): Promise<ChatRoom[]> => {
  const { data } = await api.get('/api/chat/rooms/');
  return Array.isArray(data) ? data : data.results ?? [];
};

export const fetchMessages = async (roomId: string): Promise<ChatMessage[]> => {
  const { data } = await api.get(`/api/chat/messages/?room=${roomId}`);
  return Array.isArray(data) ? data : data.results ?? [];
};

export const sendMessage = async (roomId: string, payload: { text: string }): Promise<ChatMessage> => {
  const { data } = await api.post<ChatMessage>(`/api/chat/rooms/${roomId}/messages/`, payload);
  return data;
};

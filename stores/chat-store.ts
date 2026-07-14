// stores/chat-store.ts
import { create } from 'zustand';
import type { ChatRoom, ChatMessage } from '@/lib/types';

interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  socket: WebSocket | null;
  loading: boolean;
  error: string | null;
  setRooms: (rooms: ChatRoom[]) => void;
  setActiveRoom: (roomId: string) => void;
  addMessage: (roomId: string, message: ChatMessage) => void;
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  connectWebSocket: (token: string) => void;
  disconnectWebSocket: () => void;
  sendMessage: (roomId: string, text: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  socket: null,
  loading: false,
  error: null,

  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addMessage: (roomId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), message],
      },
    })),

  setMessages: (roomId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: messages },
    })),

  connectWebSocket: (token) => {
    if (get().socket) return;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';
    const ws = new WebSocket(`${wsUrl}/ws/chat/?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message_sent' && data.message) {
          get().addMessage(data.message.room, data.message);
        } else if (data.type === 'rooms_list' && data.rooms) {
          get().setRooms(data.rooms);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => set({ error: 'WebSocket connection error' });
    ws.onclose = () => set({ socket: null });

    set({ socket: ws });
  },

  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null });
    }
  },

  sendMessage: (roomId, text) => {
    const { socket } = get();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'send_message', room_id: roomId, text }));
    }
  },
}));

import { create } from 'zustand';
import { ChatRoom, Message } from '@/lib/api/chat';

interface ChatState {
    rooms: ChatRoom[];
    activeRoomId: string | null;
    messages: Record<string, Message[]>; // room_id -> messages
    socket: WebSocket | null;
    setRooms: (rooms: ChatRoom[]) => void;
    setActiveRoom: (roomId: string) => void;
    addMessage: (roomId: string, message: Message) => void;
    setMessages: (roomId: string, messages: Message[]) => void;
    connectWebSocket: (token: string) => void;
    disconnectWebSocket: () => void;
    sendMessage: (roomId: string, text: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    rooms: [],
    activeRoomId: null,
    messages: {},
    socket: null,

    setRooms: (rooms) => set({ rooms }),
    setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
    addMessage: (roomId, message) => set((state) => ({
        messages: {
            ...state.messages,
            [roomId]: [...(state.messages[roomId] || []), message]
        }
    })),
    setMessages: (roomId, messages) => set((state) => ({
        messages: {
            ...state.messages,
            [roomId]: messages
        }
    })),

    connectWebSocket: (token) => {
        if (get().socket) return;
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';
        const ws = new WebSocket(`${wsUrl}/ws/chat/?token=${token}`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'message_sent') {
                get().addMessage(data.message.room, data.message);
            } else if (data.type === 'rooms_list') {
                get().setRooms(data.rooms);
            }
        };

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
    }
}));

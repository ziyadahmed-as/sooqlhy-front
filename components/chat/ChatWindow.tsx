import React, { useEffect } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { fetchRooms, fetchMessages, sendMessage as apiSendMessage } from '@/lib/api/chat';

export const ChatWindow: React.FC = () => {
  const {
    rooms,
    activeRoomId,
    messages,
    setRooms,
    setActiveRoom,
    setMessages,
    connectWebSocket,
    disconnectWebSocket,
    sendMessage,
    socket,
  } = useChatStore();

  // Load initial rooms
  useEffect(() => {
    const load = async () => {
      const data = await fetchRooms();
      setRooms(data);
      if (data.length > 0) setActiveRoom(data[0].id);
    };
    load();
  }, []);

  // Load messages for active room
  useEffect(() => {
    if (!activeRoomId) return;
    const loadMessages = async () => {
      const msgs = await fetchMessages(activeRoomId);
      setMessages(activeRoomId, msgs);
    };
    loadMessages();
  }, [activeRoomId]);

  // WebSocket connection on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    connectWebSocket(token);
    return () => disconnectWebSocket();
  }, []);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as any;
    const text = form.message.value.trim();
    if (!text || !activeRoomId) return;
    await apiSendMessage(activeRoomId, { text });
    form.reset();
  };

  return (
    <div className="flex h-full">
      {/* Rooms list */}
      <aside className="w-1/4 border-r p-2 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Rooms</h2>
        <ul>
          {rooms.map((room) => (
            <li
              key={room.id}
              className={`p-2 rounded cursor-pointer ${room.id === activeRoomId ? 'bg-indigo-200' : ''}`}
              onClick={() => setActiveRoom(room.id)}
            >
              {room.buyer_username} ↔ {room.seller_username}
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat area */}
      <section className="flex-1 flex flex-col p-2">
        <div className="flex-1 overflow-y-auto mb-4">
          {activeRoomId && messages[activeRoomId]
            ? messages[activeRoomId].map((msg) => (
                <div key={msg.id} className={`mb-2 ${msg.sender === 'me' ? 'text-right' : ''}`}>
                  <span className="inline-block bg-gray-200 rounded px-2 py-1">{msg.text}</span>
                </div>
              ))
            : <p className="text-gray-500">Select a conversation</p>}
        </div>
        {activeRoomId && (
          <form onSubmit={handleSend} className="flex">
            <input
              name="message"
              type="text"
              placeholder="Type a message..."
              className="flex-1 border rounded px-2 py-1 mr-2"
              required
            />
            <button type="submit" className="bg-indigo-600 text-white rounded px-4 py-1">
              Send
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

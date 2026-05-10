"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import { useAuth } from "@/hooks/use_auth";
import { fetchChatHistory, sendChatMessage as sendChatApiMessage } from "@/lib/chat-api";

interface Message {
  id: string;
  bookingId: string;
  senderId?: string;
  senderType: "User" | "Company" | "System";
  content: string;
  type: "text" | "event" | "image";
  metadata?: Record<string, any>;
  createdAt: string;
}

interface ChatContextType {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  sendMessage: (bookingId: string, content: string) => Promise<void>;
  joinRoom: (bookingId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const API_BASE = resolveApiBaseUrl();
const WS_URL = API_BASE.replace(/^http/, "ws").replace(/\/api$/, "");

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[ChatProvider] Socket connected:", socket.id);
      setIsConnected(true);
      
      // If we were in a room, re-join it
      if (currentRoomRef.current) {
        socket.emit("join_booking_room", { 
          bookingId: currentRoomRef.current, 
          userId: user.id 
        });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const joinRoom = useCallback((bookingId: string) => {
    if (!socketRef.current || !user) return;

    // Reset messages when switching rooms
    setMessages([]);
    currentRoomRef.current = bookingId;

    socketRef.current.emit("join_booking_room", { 
      bookingId, 
      userId: user.id 
    });

    // Fetch history via API
    setIsLoading(true);
    fetchChatHistory(bookingId)
      .then(data => {
        setMessages(data);
      })
      .catch(err => console.error("Failed to fetch chat history:", err))
      .finally(() => setIsLoading(false));
  }, [user]);

  const sendMessage = useCallback(async (bookingId: string, content: string) => {
    // We send via REST API to ensure it's saved to DB first
    try {
      const data = await sendChatApiMessage(bookingId, content);
      if (!data.success) {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("SendMessage error:", err);
    }
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isConnected, isLoading, sendMessage, joinRoom }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}

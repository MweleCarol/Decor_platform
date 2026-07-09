import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { connectSocket } from "@/lib/socket-client";

interface Message {
  id: string;
  content?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  readAt?: string;
  createdAt: string;
  sender: { id: string; fullName: string; role: "CUSTOMER" | "ADMIN"; avatarUrl?: string };
}

export function useMyConversation() {
  return useQuery({
    queryKey: ["my-conversation"],
    queryFn: async () => {
      const { data } = await api.get("/api/chat/conversation");
      return data.conversation;
    },
    retry: false,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    enabled:  !!conversationId,
    queryFn: async () => {
      const { data } = await api.get(
        `/api/chat/conversations/${conversationId}/messages?pageSize=50`
      );
      return (data.messages ?? []) as Message[];
    },
  });
}

// Live message subscription via Socket.IO
export function useLiveMessages(conversationId: string | null) {
  const queryClient                     = useQueryClient();
  const [isTyping, setIsTyping]         = useState(false);
  const [onlineUsers, setOnlineUsers]   = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!conversationId) return;
    const socket = connectSocket();

    socket.emit("join:conversation", conversationId);

    socket.on("message:new", (msg: Message) => {
      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (prev = []) =>
          prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
    });

    socket.on("typing:start", () => setIsTyping(true));
    socket.on("typing:stop",  () => setIsTyping(false));

    socket.on("presence:online",  ({ userId }: { userId: string }) => {
      setOnlineUsers((s) => new Set([...s, userId]));
    });
    socket.on("presence:offline", ({ userId }: { userId: string }) => {
      setOnlineUsers((s) => { const n = new Set(s); n.delete(userId); return n; });
    });

    return () => {
      socket.emit("leave:conversation", conversationId);
      socket.off("message:new");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("presence:online");
      socket.off("presence:offline");
    };
  }, [conversationId, queryClient]);

  return { isTyping, onlineUsers };
}

export function useSendMessage(conversationId: string | null) {
  return (content: string) => {
    if (!content.trim() || !conversationId) return;
    const socket = connectSocket();
    socket.emit("message:send", { conversationId, content: content.trim() });
  };
}

export function useMarkRead(conversationId: string | null) {
  return () => {
    if (!conversationId) return;
    const socket = connectSocket();
    socket.emit("messages:read", conversationId);
  };
}

export function useAllConversations() {
  return useQuery({
    queryKey: ["admin", "conversations"],
    queryFn: async () => {
      const { data } = await api.get("/api/chat/conversations");
      return data.conversations;
    },
    refetchInterval: 15000,
  });
}
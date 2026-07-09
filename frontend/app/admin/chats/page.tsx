"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Send, Paperclip, MessageSquare, Circle } from "lucide-react";
import { api } from "@/lib/api-client";
import { connectSocket, disconnectSocket } from "@/lib/socket-client";
import { useAuthStore } from "@/stores/auth.store";
import { formatRelativeTime, cn } from "@/lib/utils";

interface Message {
  id: string;
  content?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  readAt?: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    role: "CUSTOMER" | "ADMIN";
    avatarUrl?: string;
  };
}

interface Conversation {
  id: string;
  lastMessageAt: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  messages: Message[];
}

export default function AdminChatsPage() {
  const { user }                            = useAuthStore();
  const [activeId, setActiveId]             = useState<string | null>(null);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [text, setText]                     = useState("");
  const [typing, setTyping]                 = useState(false);
  const [onlineUsers, setOnlineUsers]       = useState<Set<string>>(new Set());
  const messagesEndRef                      = useRef<HTMLDivElement>(null);
  const typingTimeoutRef                    = useRef<NodeJS.Timeout>();

  // Load all conversations
  const { data, isLoading } = useQuery<{ conversations: Conversation[] }>({
    queryKey: ["admin", "conversations"],
    queryFn: async () => {
      const { data } = await api.get("/api/chat/conversations");
      return data;
    },
    refetchInterval: 10000,
  });

  const conversations = data?.conversations ?? [];
  const active = conversations.find((c) => c.id === activeId);

  // Load messages when conversation selected
  useEffect(() => {
    if (!activeId) return;
     let ignore = false;
  setMessages([]);
  api.get(`/api/chat/conversations/${activeId}/messages?pageSize=50`)
   .then(({ data }) => { if (!ignore) setMessages(data.messages ?? []); })
    .catch((err) => { if (!ignore) console.error(err); });
  return () => { ignore = true; };
  }, [activeId]);

  // Socket.IO setup
  useEffect(() => {
    const socket = connectSocket();

    socket.on("message:new", (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("typing:start", () => setTyping(true));
    socket.on("typing:stop",  () => setTyping(false));

    socket.on("presence:online",  ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });
    socket.on("presence:offline", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => { const s = new Set(prev); s.delete(userId); return s; });
    });

    return () => { disconnectSocket(); };
  }, []);

  // Join conversation room when switching
  useEffect(() => {
    if (!activeId) return;
    const socket = connectSocket();
    socket.emit("join:conversation", activeId);
    socket.emit("messages:read", activeId);
    return () => socket.emit("leave:conversation", activeId);
  }, [activeId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!text.trim() || !activeId) return;
    const socket = connectSocket();
    socket.emit("message:send", { conversationId: activeId, content: text.trim() });
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleTyping() {
    if (!activeId) return;
    const socket = connectSocket();
    socket.emit("typing:start", activeId);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", activeId);
    }, 1500);
  }

  return (
    <div className="flex h-screen">

      {/* Conversation list */}
      <aside className="w-72 shrink-0 border-r border-stone-200 bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-stone-100">
          <h1 className="font-semibold text-stone-800">Messages</h1>
          <p className="text-xs text-stone-400 mt-0.5">{conversations.length} conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-stone-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-stone-200 rounded w-3/4" />
                    <div className="h-2.5 bg-stone-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
              <MessageSquare size={28} className="text-stone-300" />
              <p className="text-sm text-stone-400">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const lastMsg = conv.messages[0];
              const isOnline = onlineUsers.has(conv.customer.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-stone-50",
                    activeId === conv.id ? "bg-gold-50" : "hover:bg-stone-50"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gold-100 text-gold-700 text-sm font-bold flex items-center justify-center">
                      {conv.customer.fullName.charAt(0)}
                    </div>
                    {isOnline && (
                      <Circle
                        size={8}
                        className="absolute bottom-0 right-0 text-emerald-500 fill-emerald-400"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-800 truncate">
                        {conv.customer.fullName}
                      </p>
                      <p className="text-[10px] text-stone-400 shrink-0 ml-1">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </p>
                    </div>
                    {lastMsg?.content && (
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        {lastMsg.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col bg-stone-50">
        {!activeId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <MessageSquare size={40} className="text-stone-300" />
            <p className="text-stone-400 text-sm">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gold-100 text-gold-700 text-sm font-bold flex items-center justify-center">
                  {active?.customer.fullName.charAt(0)}
                </div>
                {active && onlineUsers.has(active.customer.id) && (
                  <Circle size={8} className="absolute bottom-0 right-0 text-emerald-500 fill-emerald-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-stone-800">{active?.customer.fullName}</p>
                <p className="text-xs text-stone-400">
                  {active && onlineUsers.has(active.customer.id) ? (
                    <span className="text-emerald-500">Online</span>
                  ) : (
                    active?.customer.email
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {messages.map((msg) => {
                const isAdmin = msg.sender.role === "ADMIN";
                return (
                  <div
                    key={msg.id}
                    className={cn("flex gap-2.5 max-w-[75%]", isAdmin ? "ml-auto flex-row-reverse" : "")}
                  >
                    {!isAdmin && (
                      <div className="w-7 h-7 rounded-full bg-gold-100 text-gold-700 text-xs font-bold flex items-center justify-center shrink-0 mt-auto">
                        {msg.sender.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                          isAdmin
                            ? "bg-stone-900 text-white rounded-tr-sm"
                            : "bg-white border border-stone-200 text-stone-800 rounded-tl-sm"
                        )}
                      >
                        {msg.content}
                        {msg.attachmentUrl && (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-1 text-xs underline opacity-70"
                          >
                            View attachment
                          </a>
                        )}
                      </div>
                      <p className={cn("text-[10px] text-stone-400 mt-1", isAdmin ? "text-right" : "")}>
                        {formatRelativeTime(msg.createdAt)}
                        {isAdmin && msg.readAt && <span className="ml-1">· Read</span>}
                      </p>
                    </div>
                  </div>
                );
              })}

              {typing && (
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1 bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-stone-200 px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(e) => { setText(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  className="flex-1 resize-none px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 max-h-32"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className="w-10 h-10 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:opacity-40 flex items-center justify-center text-white transition-colors shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
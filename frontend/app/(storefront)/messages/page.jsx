"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Bot, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { connectSocket, disconnectSocket } from "@/lib/socket-client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { formatRelativeTime, cn } from "@/lib/utils";

export default function MessagesPage() {
  const { user }                    = useAuthStore();
  const [tab, setTab]               = useState("ai");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [botHistory, setBotHistory] = useState([]);
  const [text, setText]             = useState("");
  const [aiTyping, setAiTyping]     = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const messagesEndRef              = useRef(null);
  const typingRef                   = useRef();

  // Load or create conversation
  const { data: convData } = useQuery({
    queryKey: ["my-conversation"],
    enabled:  !!user && tab === "human",
    queryFn:  async () => {
      const { data } = await api.get("/api/chat/conversation");
      return data;
    },
  });

  useEffect(() => {
    if (convData?.conversation) {
      setConversationId(convData.conversation.id);
    }
  }, [convData]);

  // Load message history
  useEffect(() => {
    if (!conversationId || tab !== "human") return;
    api.get(`/api/chat/conversations/${conversationId}/messages?pageSize=50`)
      .then(({ data }) => setMessages(data.messages ?? []));
  }, [conversationId, tab]);

  // Socket.IO
  useEffect(() => {
    if (!user || tab !== "human") return;
    const socket = connectSocket();

    socket.on("message:new", (msg) => {
      setMessages((prev) => prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]);
    });
    socket.on("typing:start", () => setAdminTyping(true));
    socket.on("typing:stop",  () => setAdminTyping(false));

    return () => { disconnectSocket(); };
  }, [user, tab]);

  useEffect(() => {
    if (conversationId && tab === "human") {
      const socket = connectSocket();
      socket.emit("join:conversation", conversationId);
      socket.emit("messages:read", conversationId);
    }
  }, [conversationId, tab]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botHistory, aiTyping]);

  // Send to human chat
  function sendHumanMessage() {
    if (!text.trim() || !conversationId) return;
    const socket = connectSocket();
    socket.emit("message:send", { conversationId, content: text.trim() });
    setText("");
  }

  // AI assistant mutation
  const askAI = useMutation({
    mutationFn: async (message) => {
      const { data } = await api.post("/api/ai/assistant/message", {
        message,
        history: botHistory.slice(-10),
      });
      return data.reply;
    },
    onMutate: (message) => {
      setBotHistory((h) => [...h, { role: "user", content: message }]);
      setAiTyping(true);
    },
    onSuccess: (reply) => {
      setBotHistory((h) => [...h, { role: "assistant", content: reply }]);
      setAiTyping(false);
    },
    onError: () => {
      setAiTyping(false);
      toast.error("AI assistant is unavailable right now");
    },
  });

  // Escalate to human
  const escalateMutation = useMutation({
    mutationFn: async () => {
      const summary = botHistory
        .map((m) => `${m.role === "user" ? "Customer" : "AI"}: ${m.content}`)
        .join("\n");
      await api.post("/api/ai/assistant/escalate", { summary });
    },
    onSuccess: () => {
      toast.success("Conversation handed to our team. Switching to live chat.");
      setTab("human");
    },
    onError: () => toast.error("Please sign in to escalate to our team"),
  });

  function handleSend() {
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    if (tab === "ai") {
      askAI.mutate(msg);
    } else {
      sendHumanMessage();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleTyping() {
    if (tab !== "human" || !conversationId) return;
    const socket = connectSocket();
    socket.emit("typing:start", conversationId);
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => socket.emit("typing:stop", conversationId), 1500);
  }

  const STARTERS = [
    "What curtain colours work with a grey sofa?",
    "Do you have blackout curtains for bedrooms?",
    "How do I measure my windows for curtains?",
    "What pillow sizes do you carry?",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl font-bold text-stone-900 mb-6">Messages</h1>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        {([
          { key: "ai",    label: "AI Assistant", icon: <Bot size={14} /> },
          { key: "human", label: "Live Chat",    icon: <MessageSquare size={14} /> },
        ]).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === key
                ? "bg-white shadow-sm text-stone-900"
                : "text-stone-500 hover:text-stone-700"
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col h-[600px]">

        {/* Chat header */}
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tab === "ai" ? (
              <>
                <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">Décor AI</p>
                  <p className="text-xs text-emerald-500">Always online</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-xs font-bold">D</div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">Decor Platform Team</p>
                  <p className="text-xs text-stone-400">Typically replies within 1 hour</p>
                </div>
              </>
            )}
          </div>
          {tab === "ai" && botHistory.length > 0 && (
            <button
              onClick={() => escalateMutation.mutate()}
              className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
            >
              Talk to a person <ArrowRight size={11} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {tab === "ai" ? (
            <>
              {botHistory.length === 0 && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                      <Bot size={13} className="text-gold-600" />
                    </div>
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-stone-700 max-w-xs">
                      Hi! I'm Décor AI. I can help with product questions, decorating advice, and more. What can I help you with today?
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-10">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => askAI.mutate(s)}
                        className="text-xs border border-stone-200 rounded-full px-3 py-1.5 text-stone-600 hover:border-gold-400 hover:text-gold-600 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {botHistory.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div key={i} className={cn("flex gap-3", isUser ? "flex-row-reverse" : "")}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center shrink-0 mt-auto">
                        <Bot size={13} className="text-gold-600" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm max-w-sm leading-relaxed",
                        isUser
                          ? "bg-stone-900 text-white rounded-tr-sm"
                          : "bg-stone-50 border border-stone-200 text-stone-800 rounded-tl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {aiTyping && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                    <Bot size={13} className="text-gold-600" />
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0,1,2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {!user ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <MessageSquare size={32} className="text-stone-300" />
                  <p className="text-stone-500 text-sm">Sign in to chat with our team</p>
                  <Link href="/login"><Button size="sm">Sign In</Button></Link>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <MessageSquare size={32} className="text-stone-300" />
                  <p className="text-stone-500 text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id} className={cn("flex gap-2.5 max-w-[75%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 text-xs font-bold flex items-center justify-center shrink-0 mt-auto">
                          D
                        </div>
                      )}
                      <div>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                          isMe
                            ? "bg-stone-900 text-white rounded-tr-sm"
                            : "bg-stone-50 border border-stone-200 text-stone-800 rounded-tl-sm"
                        )}>
                          {msg.content}
                        </div>
                        <p className={cn("text-[10px] text-stone-400 mt-1", isMe ? "text-right" : "")}>
                          {formatRelativeTime(msg.createdAt)}
                          {isMe && msg.readAt && <span className="ml-1">· Read</span>}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              {adminTyping && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 text-xs font-bold flex items-center justify-center shrink-0">D</div>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 flex gap-1">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-stone-100 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); handleTyping(); }}
              onKeyDown={handleKeyDown}
              placeholder={tab === "ai" ? "Ask Décor AI anything…" : "Type a message…"}
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 max-h-28"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || (tab === "human" && !user)}
              className="w-10 h-10 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:opacity-40 flex items-center justify-center text-white transition-colors shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
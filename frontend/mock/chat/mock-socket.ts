import { CONVERSATION_THREADS } from "./messages.data";

type Listener = (...args: any[]) => void;

const CANNED_REPLIES = [
  "Thanks for the quick response!",
  "Got it, appreciate the help.",
  "Perfect, that works for me.",
  "Okay, I'll keep an eye out for that then.",
  "Thank you so much!",
];

/**
 * Minimal fake of the socket.io-client Socket interface — only the
 * methods admin/chats/page.tsx actually calls (on/off/emit/connect/
 * disconnect, plus a `connected` flag). Not a full Socket implementation,
 * cast to `Socket` at the call site since nothing else touches it.
 */
class MockSocket {
  connected = false;
  private listeners: Record<string, Listener[]> = {};

  on(event: string, handler: Listener) {
    (this.listeners[event] ??= []).push(handler);
    return this;
  }

  off(event: string, handler?: Listener) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = handler
      ? this.listeners[event].filter((h) => h !== handler)
      : [];
    return this;
  }

  private trigger(event: string, ...args: any[]) {
    (this.listeners[event] ?? []).forEach((h) => h(...args));
  }

  connect() {
    this.connected = true;
    // Simulate a couple of customers already online, matching two of
    // the seeded conversation threads (Diana Achieng, Mercy Chebet).
    setTimeout(() => {
      this.trigger("presence:online", { userId: "cust-04" });
      this.trigger("presence:online", { userId: "cust-11" });
    }, 500);
    return this;
  }

  disconnect() {
    this.connected = false;
    this.listeners = {};
  }

  emit(event: string, ...args: any[]) {
    switch (event) {
      case "message:send": {
        const { conversationId, content } = args[0] ?? {};

        // Echo the admin's own message back, mimicking the real
        // server round-trip (the page never adds it locally on send).
        setTimeout(() => {
          this.trigger("message:new", {
            id: `mock-msg-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            sender: { id: "mock-user-admin", fullName: "Admin User", role: "ADMIN" },
          });
        }, 200);

        // Simulate the customer typing, then replying.
        const thread = CONVERSATION_THREADS[conversationId];
        const customerSender = thread?.find((m) => m.sender.role === "CUSTOMER")?.sender;
        if (customerSender) {
          setTimeout(() => this.trigger("typing:start"), 1200);
          setTimeout(() => {
            this.trigger("typing:stop");
            this.trigger("message:new", {
              id: `mock-msg-${Date.now()}-reply`,
              content: CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)],
              createdAt: new Date().toISOString(),
              sender: customerSender,
            });
          }, 2600);
        }
        break;
      }
      // join/leave/typing/messages:read — no server round-trip needed
      // for the mock to behave correctly, so intentionally no-ops.
      default:
        break;
    }
    return this;
  }
}

let instance: MockSocket | null = null;

export function getMockSocket(): MockSocket {
  if (!instance) instance = new MockSocket();
  return instance;
}
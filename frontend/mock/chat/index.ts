import { CONVERSATION_THREADS, MockChatMessage } from "./messages.data";
import { CUSTOMERS } from "@/mock/customers";

export { CONVERSATION_THREADS } from "./messages.data";

const MOCK_DELAY_MS = 350;
function delay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function findCustomerMeta(customerId: string) {
  const match = CUSTOMERS.find((c) => c.id === customerId);
  return {
    id: customerId,
    fullName: match?.fullName ?? "Unknown Customer",
    email: match?.email ?? "unknown@example.com",
  };
}

/**
 * Mirrors GET /api/chat/conversations — list view, where `messages`
 * holds only the single most recent message for the preview line.
 */
export async function getMockConversations() {
  const conversations = Object.entries(CONVERSATION_THREADS).map(([id, thread]) => {
    const lastMessage = thread[thread.length - 1];
    const customerId = thread.find((m) => m.sender.role === "CUSTOMER")!.sender.id;

    return {
      id,
      lastMessageAt: lastMessage.createdAt,
      customer: findCustomerMeta(customerId),
      messages: [lastMessage],
    };
  });

  conversations.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  return delay({ conversations });
}

/**
 * Mirrors GET /api/chat/conversations/:id/messages
 */
export async function getMockMessages(conversationId: string): Promise<{ messages: MockChatMessage[] }> {
  const thread = CONVERSATION_THREADS[conversationId] ?? [];
  return delay({ messages: thread });
}
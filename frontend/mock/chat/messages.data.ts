export interface MockChatMessage {
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

const ADMIN_SENDER = { id: "mock-user-admin", fullName: "Admin User", role: "ADMIN" as const };

function customer(id: string, fullName: string) {
  return { id, fullName, role: "CUSTOMER" as const };
}

// Full message threads, keyed by conversation id.
// Each thread's LAST message is what the conversation list preview shows.
export const CONVERSATION_THREADS: Record<string, MockChatMessage[]> = {
  "conv-01": [
    { id: "msg-01-1", content: "Hi! Does the Belgian Linen curtain come in a longer drop than 228cm?", createdAt: "2026-08-12T09:14:00Z", sender: customer("cust-04", "Diana Achieng") },
    { id: "msg-01-2", content: "Hi Diana! Yes, we have a 274cm option in Sage. I can send a link.", createdAt: "2026-08-12T09:22:00Z", readAt: "2026-08-12T09:25:00Z", sender: ADMIN_SENDER },
    { id: "msg-01-3", content: "That's perfect, thank you!", createdAt: "2026-08-12T09:26:00Z", sender: customer("cust-04", "Diana Achieng") },
  ],
  "conv-02": [
    { id: "msg-02-1", content: "My order #ORD-0009 shows Processing for 4 days now, any update?", createdAt: "2026-08-13T15:02:00Z", sender: customer("cust-07", "Otieno Ochieng") },
  ],
  "conv-03": [
    { id: "msg-03-1", content: "Do you deliver to Nyeri town?", createdAt: "2026-08-10T11:40:00Z", sender: customer("cust-09", "Sarah Mumbi") },
    { id: "msg-03-2", content: "Yes, we deliver countrywide via courier — usually 2-3 business days to Nyeri.", createdAt: "2026-08-10T12:05:00Z", readAt: "2026-08-10T12:30:00Z", sender: ADMIN_SENDER },
    { id: "msg-03-3", content: "Great, placing an order now", createdAt: "2026-08-10T12:31:00Z", sender: customer("cust-09", "Sarah Mumbi") },
    { id: "msg-03-4", content: "Wonderful, looking forward to it!", createdAt: "2026-08-10T12:40:00Z", readAt: "2026-08-10T13:00:00Z", sender: ADMIN_SENDER },
  ],
  "conv-04": [
    { id: "msg-04-1", content: "Here's a photo of the rug I received — the color looks different from the site", attachmentUrl: "/images/image11.jpg", attachmentType: "image", createdAt: "2026-08-13T08:10:00Z", sender: customer("cust-11", "Mercy Chebet") },
  ],
  "conv-05": [
    { id: "msg-05-1", content: "Can I combine two orders into one delivery to save on shipping?", createdAt: "2026-08-09T16:20:00Z", sender: customer("cust-08", "Anne Mbeki") },
    { id: "msg-05-2", content: "If both are still in Pending status, yes — I can merge them for you. Order numbers?", createdAt: "2026-08-09T16:35:00Z", readAt: "2026-08-09T16:50:00Z", sender: ADMIN_SENDER },
  ],
  "conv-06": [
    { id: "msg-06-1", content: "Loved the AI Designer output for my living room! When will the recommended pieces be back in stock?", createdAt: "2026-08-11T19:05:00Z", sender: customer("cust-13", "Victor Njuguna") },
  ],
};
import { prisma } from "../../config/prisma.js";
import { chatCompletion } from "../../shared/services/openai.service.js";

const SYSTEM_PROMPT = `You are Décor AI, a helpful assistant for the Decor Platform — a Kenyan home décor store.

You help customers with:
- Product questions (curtains, throw pillows, mosquito nets, bedding, home décor)
- Interior decorating advice and color matching
- Product recommendations based on room type and style
- Order tracking (if they share their order ID)
- Pricing and availability questions

Rules:
- Keep responses concise, friendly, and professional
- Prices are in Kenyan Shillings (KES)
- If asked about very specific stock or order details you cannot access, politely suggest they contact the owner via the live chat feature
- Never make up product availability — say you will check if unsure
- If a customer is upset or needs human help, suggest escalating to the owner`;

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendMessage(
  message: string,
  history: HistoryMessage[]
): Promise<string> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: message },
  ];

  return chatCompletion(messages);
}

export async function escalateToHuman(
  userId: string,
  summary: string
): Promise<{ conversationId: string }> {
  let conversation = await prisma.conversation.findFirst({
    where: { customerId: userId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { customerId: userId },
    });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      content: `[Escalated from AI Assistant]\n\n${summary}`,
    },
  });

  return { conversationId: conversation.id };
}
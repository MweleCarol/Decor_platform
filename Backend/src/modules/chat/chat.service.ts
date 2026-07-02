import { prisma } from "../../config/prisma.js";
import { NotFoundError, ForbiddenError } from "../../shared/errors/app-error.js";
import type { SendMessageInput, ListMessagesQuery } from "./chat.schema.js";

// Get or create a conversation for this customer
export async function getOrCreateConversation(customerId: string) {
  const existing = await prisma.conversation.findFirst({
    where: { customerId },
    include: {
      customer: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: { customerId },
    include: {
      customer: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
      messages: true,
    },
  });
}

// List all conversations — admin only
export async function listAllConversations() {
  return prisma.conversation.findMany({
    include: {
      customer: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });
}

export async function getMessages(
  conversationId: string,
  requesterId: string,
  isAdmin: boolean,
  query: ListMessagesQuery
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) throw new NotFoundError("Conversation not found");

  // Customers can only read their own conversation
  if (!isAdmin && conversation.customerId !== requesterId) {
    throw new ForbiddenError("Access denied");
  }

  const { page, pageSize } = query;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  return {
    messages: messages.reverse(), // Return chronologically
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  isAdmin: boolean,
  input: SendMessageInput
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) throw new NotFoundError("Conversation not found");

  if (!isAdmin && conversation.customerId !== senderId) {
    throw new ForbiddenError("Access denied");
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: input.content,
        attachmentUrl: input.attachmentUrl,
        attachmentType: input.attachmentType,
      },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return message;
}

export async function markMessagesRead(
  conversationId: string,
  readerId: string
) {
  // Mark all messages NOT sent by reader as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: readerId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}
import { z } from "zod";

export const conversationIdParamSchema = z.object({
  conversationId: z.uuid(),
});

export const sendMessageSchema = z.object({
  content: z.string().max(5000).optional(),
  attachmentUrl: z.string().optional(),
  attachmentType: z.enum(["image", "file"]).optional(),
});

export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
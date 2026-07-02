import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth, requireAdmin } from "../../shared/middleware/auth-guard.js";
import {
  conversationIdParamSchema,
  sendMessageSchema,
  listMessagesQuerySchema,
} from "./chat.schema.js";
import {
  getOrCreateConversationHandler,
  listAllConversationsHandler,
  getMessagesHandler,
  sendMessageHandler,
  markReadHandler,
} from "./chat.controller.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);

// Customer: get or start their conversation
chatRouter.get(
  "/conversation",
  asyncHandler(getOrCreateConversationHandler)
);

// Admin: list all customer conversations
chatRouter.get(
  "/conversations",
  requireAdmin,
  asyncHandler(listAllConversationsHandler)
);

// Get messages for a conversation
chatRouter.get(
  "/conversations/:conversationId/messages",
  validate({ params: conversationIdParamSchema, query: listMessagesQuerySchema }),
  asyncHandler(getMessagesHandler)
);

// Send a message via REST (Socket.IO is primary; this is the fallback)
chatRouter.post(
  "/conversations/:conversationId/messages",
  validate({ params: conversationIdParamSchema, body: sendMessageSchema }),
  asyncHandler(sendMessageHandler)
);

// Mark messages as read
chatRouter.patch(
  "/conversations/:conversationId/read",
  validate({ params: conversationIdParamSchema }),
  asyncHandler(markReadHandler)
);
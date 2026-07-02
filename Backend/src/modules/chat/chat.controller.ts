import type { Request, Response } from "express";
import * as chatService from "./chat.service.js";
import type { SendMessageInput, ListMessagesQuery } from "./chat.schema.js";

export async function getOrCreateConversationHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const conversation = await chatService.getOrCreateConversation(userId);
  res.status(200).json({ conversation });
}

export async function listAllConversationsHandler(req: Request, res: Response) {
  const conversations = await chatService.listAllConversations();
  res.status(200).json({ conversations });
}

export async function getMessagesHandler(req: Request, res: Response) {
  const { conversationId } = res.locals.validated.params as { conversationId: string };
  const query = res.locals.validated.query as ListMessagesQuery;
  const userId = res.locals.auth!.userId;
  const isAdmin = res.locals.auth!.role === "ADMIN";
  const result = await chatService.getMessages(conversationId, userId, isAdmin, query);
  res.status(200).json(result);
}

export async function sendMessageHandler(req: Request, res: Response) {
  const { conversationId } = res.locals.validated.params as { conversationId: string };
  const input = res.locals.validated.body as SendMessageInput;
  const userId = res.locals.auth!.userId;
  const isAdmin = res.locals.auth!.role === "ADMIN";
  const message = await chatService.sendMessage(conversationId, userId, isAdmin, input);
  res.status(201).json({ message });
}

export async function markReadHandler(req: Request, res: Response) {
  const { conversationId } = res.locals.validated.params as { conversationId: string };
  const userId = res.locals.auth!.userId;
  await chatService.markMessagesRead(conversationId, userId);
  res.status(204).send();
}
import type { Request, Response } from "express";
import * as assistantService from "./assistant.service.js";

interface MessageBody {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

interface EscalateBody {
  summary: string;
}

export async function sendMessageHandler(req: Request, res: Response) {
  const { message, history } = res.locals.validated.body as MessageBody;
  const reply = await assistantService.sendMessage(message, history);
  res.status(200).json({ reply });
}

export async function escalateHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const { summary } = res.locals.validated.body as EscalateBody;
  const result = await assistantService.escalateToHuman(userId, summary);
  res.status(200).json({
    ...result,
    message: "Your conversation has been escalated to our team. We will respond shortly.",
  });
}
import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth } from "../../shared/middleware/auth-guard.js";
import { sendMessageHandler, escalateHandler } from "./assistant.controller.js";

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(10)
    .default([]),
});

const escalateSchema = z.object({
  summary: z.string().min(1).max(500),
});

export const assistantRouter = Router();

assistantRouter.post(
  "/message",
  validate({ body: messageSchema }),
  asyncHandler(sendMessageHandler)
);

assistantRouter.post(
  "/escalate",
  requireAuth,
  validate({ body: escalateSchema }),
  asyncHandler(escalateHandler)
);
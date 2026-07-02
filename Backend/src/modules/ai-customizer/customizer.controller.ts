import type { Request, Response } from "express";
import * as customizerService from "./customizer.service.js";
import type { CreateCustomProductInput } from "./customizer.schema.js";

export async function createCustomProductHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const input = res.locals.validated.body as CreateCustomProductInput;
  const record = await customizerService.createCustomProduct(userId, input);
  res.status(202).json({
    record,
    message: "Custom product is being processed. Poll GET /api/ai/customizer/:id for status.",
  });
}

export async function getCustomProductHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const { id } = res.locals.validated.params as { id: string };
  const record = await customizerService.getCustomProduct(id, userId);
  res.status(200).json({ record });
}

export async function listCustomProductsHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const records = await customizerService.listCustomProducts(userId);
  res.status(200).json({ records });
}
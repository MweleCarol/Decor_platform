import type { Request, Response } from "express";
import multer from "multer";
import * as designerService from "./designer.service.js";
import { ValidationError } from "../../shared/errors/app-error.js";
import type { CreateDesignInput } from "./designer.schema.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

export async function createDesignHandler(req: Request, res: Response) {
  if (!req.file) throw new ValidationError("Room image is required");

  const userId = res.locals.auth!.userId;
  const input = res.locals.validated.body as CreateDesignInput;
  const design = await designerService.createDesign(userId, req.file.buffer, input);

  res.status(202).json({
    design,
    message: "Design is being processed. Poll GET /api/ai/designer/:id for status.",
  });
}

export async function getDesignHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const { id } = res.locals.validated.params as { id: string };
  const design = await designerService.getDesign(id, userId);
  res.status(200).json({ design });
}

export async function listDesignsHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const designs = await designerService.listDesigns(userId);
  res.status(200).json({ designs });
}

export async function addToCartHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const { id } = res.locals.validated.params as { id: string };
  await designerService.addDesignProductsToCart(id, userId);
  res.status(200).json({ message: "Recommended products added to cart." });
}
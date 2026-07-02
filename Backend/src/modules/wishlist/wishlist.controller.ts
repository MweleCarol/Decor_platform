import type { Request, Response } from "express";
import * as wishlistService from "./wishlist.service.js";
import type { AddToWishlistInput } from "./wishlist.schema.js";

export async function getWishlistHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const items = await wishlistService.getWishlist(userId);
  res.status(200).json({ items });
}

export async function addToWishlistHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const input = res.locals.validated.body as AddToWishlistInput;
  const item = await wishlistService.addToWishlist(userId, input);
  res.status(201).json({ item });
}

export async function removeFromWishlistHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const { productId } = res.locals.validated.params as { productId: string };
  await wishlistService.removeFromWishlist(userId, productId);
  res.status(204).send();
}
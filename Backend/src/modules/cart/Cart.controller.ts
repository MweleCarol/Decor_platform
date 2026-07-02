import type { Request, Response } from "express";
import * as cartService from "./Cart.service.js";
import type { AddToCartInput, UpdateCartItemInput } from "./Cart.schema.js";

export async function getCartHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const cart = await cartService.getCart(userId);
  res.status(200).json(cart);
}

export async function addToCartHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const input = res.locals.validated.body as AddToCartInput;
  const item = await cartService.addToCart(userId, input);
  res.status(201).json({ item });
}

export async function updateCartItemHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const { itemId } = res.locals.validated.params as { itemId: string };
  const input = res.locals.validated.body as UpdateCartItemInput;
  const item = await cartService.updateCartItem(userId, itemId, input);
  res.status(200).json({ item });
}

export async function removeCartItemHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const { itemId } = res.locals.validated.params as { itemId: string };
  await cartService.removeCartItem(userId, itemId);
  res.status(204).send();
}

export async function clearCartHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  await cartService.clearCart(userId);
  res.status(204).send();
}
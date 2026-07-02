import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid().optional(),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(100),
});

export const cartItemParamSchema = z.object({
  itemId: z.uuid(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
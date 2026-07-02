import { z } from "zod";

export const addToWishlistSchema = z.object({
  productId: z.uuid(),
});

export const wishlistProductParamSchema = z.object({
  productId: z.uuid(),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
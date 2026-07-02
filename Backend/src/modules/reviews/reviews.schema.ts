import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const reviewParamSchema = z.object({
  productId: z.uuid(),
});

export const reviewIdParamSchema = z.object({
  reviewId: z.uuid(),
});

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(["newest", "highest", "lowest"]).default("newest"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
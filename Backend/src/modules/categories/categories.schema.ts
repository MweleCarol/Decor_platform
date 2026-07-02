import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2),
  imageUrl: z.url().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
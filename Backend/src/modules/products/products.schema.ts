import { z } from "zod";

export const listProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating", "best_selling"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const productSlugParamSchema = z.object({
  slug: z.string().min(1),
});

const variantInputSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  sku: z.string().min(1),
  priceDelta: z.coerce.number().default(0),
  stock: z.coerce.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  basePrice: z.coerce.number().positive(),
  material: z.string().optional(),
  categoryId: z.uuid(),
  isBestSeller: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false),
  variants: z.array(variantInputSchema).min(1, "At least one variant is required"),
});

export const updateProductSchema = createProductSchema.partial();

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
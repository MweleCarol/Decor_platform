import { z } from "zod";

export const createCustomProductSchema = z.object({
  productType: z.enum(["curtains", "pillow_cover", "mosquito_net"]),
  fabric: z.string().optional(),
  pattern: z.string().optional(),
  color: z.string().optional(),
  measurements: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
      unit: z.enum(["cm", "inches"]).default("cm"),
    })
    .optional(),
  styleDescription: z.string().max(1000).optional(),
});

export const customizerIdParamSchema = z.object({
  id: z.uuid(),
});

export type CreateCustomProductInput = z.infer<typeof createCustomProductSchema>;
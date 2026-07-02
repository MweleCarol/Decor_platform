import { z } from "zod";

export const createDesignSchema = z.object({
  roomType: z.enum(["living_room", "bedroom", "dining_room", "kitchen", "bathroom", "office"]),
  colorPalette: z.array(z.string()).max(6).optional(),
  stylePrompt: z.string().max(1000).optional(),
});

export const designIdParamSchema = z.object({
  id: z.uuid(),
});

export type CreateDesignInput = z.infer<typeof createDesignSchema>;
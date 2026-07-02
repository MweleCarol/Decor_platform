import { z } from "zod";

const addressSchema = z.object({
  label: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  county: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Kenya"),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  // Guest fields — required only when no auth token is provided
  guestEmail: z.email().optional(),
  guestName: z.string().optional(),
  // Explicit cart items for guest checkout (authenticated users use their DB cart)
  guestItems: z
    .array(
      z.object({
        productId: z.uuid(),
        variantId: z.uuid().optional(),
        quantity: z.coerce.number().int().min(1),
      })
    )
    .optional(),
});

export const orderIdParamSchema = z.object({
  id: z.uuid(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  note: z.string().optional(),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z
    .enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
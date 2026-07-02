import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const addAddressSchema = z.object({
  label: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  county: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Kenya"),
  isDefault: z.boolean().default(false),
});

export const addressIdParamSchema = z.object({
  addressId: z.uuid(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AddAddressInput = z.infer<typeof addAddressSchema>;
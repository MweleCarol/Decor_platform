import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma.js";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../shared/errors/app-error.js";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  AddAddressInput,
} from "./users.schema.js";

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      emailVerified: true,
      aiGenerationsThisMonth: true,
      createdAt: true,
    },
  });

  if (!user) throw new NotFoundError("User not found");
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      role: true,
    },
  });
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.passwordHash) {
    throw new ValidationError("Password change is not available for OAuth accounts");
  }

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  const newHash = await bcrypt.hash(input.newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Revoke all existing refresh tokens so other sessions are invalidated
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });
}

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });
}

export async function addAddress(userId: string, input: AddAddressInput) {
  // If this is marked as default, unset any existing default first
  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.create({
    data: { ...input, userId },
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) throw new NotFoundError("Address not found");

  await prisma.address.delete({ where: { id: addressId } });
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) throw new NotFoundError("Address not found");

  await prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  return prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });
}
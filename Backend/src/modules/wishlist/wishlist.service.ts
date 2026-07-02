import { prisma } from "../../config/prisma.js";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error.js";
import type { AddToWishlistInput } from "./wishlist.schema.js";

export async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: true,
          variants: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addToWishlist(userId: string, input: AddToWishlistInput) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId: input.productId } },
  });

  if (existing) {
    throw new ConflictError("Product is already in your wishlist");
  }

  return prisma.wishlistItem.create({
    data: { userId, productId: input.productId },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: true,
        },
      },
    },
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (!existing) {
    throw new NotFoundError("Product not found in wishlist");
  }

  await prisma.wishlistItem.delete({
    where: { userId_productId: { userId, productId } },
  });
}
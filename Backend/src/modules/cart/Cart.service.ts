import { prisma } from "../../config/prisma.js";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error.js";
import type { AddToCartInput, UpdateCartItemInput } from "./Cart.schema.js";

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: true,
        },
      },
      variant: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: typeof items[number]) => {
    const base = Number(item.product.basePrice);
    const delta = item.variant ? Number(item.variant.priceDelta) : 0;
    return sum + (base + delta) * item.quantity;
  }, 0);

  return { items, subtotal: subtotal.toFixed(2) };
}

export async function addToCart(userId: string, input: AddToCartInput) {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: { variants: true },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // Verify variant belongs to product if provided
  if (input.variantId) {
    const variant = product.variants.find((v: { id: string }) => v.id === input.variantId);
    if (!variant) {
      throw new NotFoundError("Variant not found for this product");
    }
    if (variant.stock < input.quantity) {
      throw new ValidationError(
        `Only ${variant.stock} units available in stock`
      );
    }
  }

  // If the same product+variant already in cart, increment quantity
  const existing = await prisma.cartItem.findFirst({
    where: {
      userId,
      productId: input.productId,
      variantId: input.variantId ?? null,
    },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + input.quantity },
      include: {
        product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
        variant: true,
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      userId,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
    },
    include: {
      product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
      variant: true,
    },
  });
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  input: UpdateCartItemInput
) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId },
    include: { variant: true },
  });

  if (!item) {
    throw new NotFoundError("Cart item not found");
  }

  // Check stock if variant is attached
  if (item.variant && item.variant.stock < input.quantity) {
    throw new ValidationError(
      `Only ${item.variant.stock} units available in stock`
    );
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: input.quantity },
    include: {
      product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
      variant: true,
    },
  });
}

export async function removeCartItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) {
    throw new NotFoundError("Cart item not found");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
}

export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
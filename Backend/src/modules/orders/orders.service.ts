import { prisma } from "../../config/prisma.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../shared/errors/app-error.js";
import type {
  CheckoutInput,
  UpdateOrderStatusInput,
  ListOrdersQuery,
} from "./orders.schema.js";

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface ResolvedItem extends OrderItem {
  unitPrice: number;
}

export async function checkout(input: CheckoutInput, userId?: string) {
  let itemsToOrder: OrderItem[] = [];

  if (userId) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { variant: true },
    });

    if (cartItems.length === 0) {
      throw new ValidationError("Your cart is empty");
    }

    itemsToOrder = cartItems.map((item: { productId: string; variantId: string | null; quantity: number }) => ({
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      quantity: item.quantity,
    }));
  } else {
    if (!input.guestEmail) {
      throw new ValidationError("Email is required for guest checkout");
    }
    if (!input.guestItems || input.guestItems.length === 0) {
      throw new ValidationError("No items provided for guest checkout");
    }
    itemsToOrder = input.guestItems.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    }));
  }

  let totalAmount = 0;

  const resolvedItems: ResolvedItem[] = await Promise.all(
    itemsToOrder.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found`);
      }

      let unitPrice = Number(product.basePrice);

      if (item.variantId) {
        const variant = product.variants.find(
          (v: { id: string; stock: number; priceDelta: unknown }) => v.id === item.variantId
        );
        if (!variant) {
          throw new NotFoundError(`Variant ${item.variantId} not found`);
        }
        if (variant.stock < item.quantity) {
          throw new ValidationError(
            `Insufficient stock for ${product.name} — only ${variant.stock} units left`
          );
        }
        unitPrice += Number(variant.priceDelta);
      }

      totalAmount += unitPrice * item.quantity;

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
      };
    })
  );

  const order = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
    const created = await tx.order.create({
      data: {
        userId: userId ?? null,
        guestEmail: input.guestEmail,
        guestName: input.guestName,
        totalAmount,
        shippingAddressSnapshot: input.shippingAddress,
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
        statusHistory: {
          create: { status: "PENDING" as const, note: "Order placed" },
        },
      },
      include: {
        items: { include: { product: true, variant: true } },
        statusHistory: true,
      },
    });

    for (const item of resolvedItems) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    if (userId) {
      await tx.cartItem.deleteMany({ where: { userId } });
    }

    return created;
  });

  return order;
}

export async function listOrders(userId: string, query: ListOrdersQuery) {
  const { page, pageSize, status } = query;
  const where = { userId, ...(status ? { status } : {}) };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { position: "asc" }, take: 1 } },
            },
            variant: true,
          },
        },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getOrder(orderId: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
          },
          variant: true,
        },
      },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) throw new NotFoundError("Order not found");

  if (userId && order.userId !== userId) {
    throw new ForbiddenError("Access denied");
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError("Order not found");

  return prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: input.status },
    });

    await tx.orderStatusEvent.create({
      data: { orderId, status: input.status, note: input.note },
    });

    return updated;
  });
}

export async function listAllOrders(query: ListOrdersQuery) {
  const { page, pageSize, status } = query;
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true, variant: true } },
        statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}
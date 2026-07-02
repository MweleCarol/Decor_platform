import { prisma } from "../../config/prisma.js";

export async function getAnalytics() {
  const [
    totalOrders,
    totalRevenue,
    totalUsers,
    totalProducts,
    pendingOrders,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const topProductIds = topProducts.map(
    (p: { productId: string }) => p.productId
  );

  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, basePrice: true },
  });

  const enrichedTopProducts = topProducts.map(
    (tp: { productId: string; _sum: { quantity: number | null } }) => ({
      ...tp,
      product: topProductDetails.find(
        (p: { id: string }) => p.id === tp.productId
      ),
    })
  );

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    totalUsers,
    totalProducts,
    pendingOrders,
    recentOrders,
    topProducts: enrichedTopProducts,
  };
}

export async function listUsers(page: number, pageSize: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        aiGenerationsThisMonth: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function listAllDesigns() {
  return prisma.aIDesign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  });
}

export async function listAllCustomProducts() {
  return prisma.aICustomProduct.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  });
}
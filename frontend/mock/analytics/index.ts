import { ORDERS } from "@/mock/orders";
import { CUSTOMERS } from "@/mock/customers";
import { PRODUCTS } from "@/mock/product";
import type { AnalyticsData } from "@/hooks/use-admin";

const MOCK_DELAY_MS = 400;
function delay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getMockAnalytics(): Promise<{ analytics: AnalyticsData }> {
  const nonCancelled = ORDERS.filter((o) => o.status !== "CANCELLED");

  const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = ORDERS.filter((o) => o.status === "PENDING").length;

  const recentOrders = [...ORDERS]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      user: o.user,
      guestEmail: o.guestEmail,
      items: o.items.map((i) => ({ product: { name: i.product.name } })),
    }));

  // Aggregate units sold per product across all non-cancelled orders
  const salesByProduct: Record<string, number> = {};
  nonCancelled.forEach((o) => {
    o.items.forEach((item) => {
      if (!item.productId) return;
      salesByProduct[item.productId] = (salesByProduct[item.productId] ?? 0) + item.quantity;
    });
  });

  const topProducts = Object.entries(salesByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, quantity]) => {
      const product = PRODUCTS.find((p) => p.id === productId);
      return {
        productId,
        _sum: { quantity },
        product: product
          ? { id: product.id, name: product.name, basePrice: product.basePrice }
          : undefined,
      };
    });

  const analytics: AnalyticsData = {
    totalOrders: ORDERS.length,
    totalRevenue,
    totalUsers: CUSTOMERS.length,
    totalProducts: PRODUCTS.length,
    pendingOrders,
    recentOrders,
    topProducts,
  };

  return delay({ analytics });
}
import { CUSTOMERS } from "./customers.data";
import { ORDERS } from "@/mock/orders";

export { CUSTOMERS } from "./customers.data";

const MOCK_DELAY_MS = 400;
function delay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getMockUsers(params: { page?: number; pageSize?: number } = {}) {
  const { page = 1, pageSize = 20 } = params;

  const withOrderCounts = CUSTOMERS
    .map((c) => ({
      ...c,
      _count: {
        orders: ORDERS.filter((o) => o.user?.email === c.email).length,
      },
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = withOrderCounts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const users = withOrderCounts.slice(start, start + pageSize);

  return delay({
    users,
    pagination: { total, totalPages, page: safePage },
  });
}
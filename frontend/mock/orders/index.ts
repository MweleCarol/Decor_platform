import { ORDERS } from "./orders.data";
import type { AdminOrder } from "@/hooks/use-admin";

export { ORDERS } from "./orders.data";

const MOCK_DELAY_MS = 400;
function delay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getMockOrders(params: {
  page?: number;
  status?: string;
  pageSize?: number;
} = {}) {
  const { page = 1, status, pageSize = 20 } = params;

  let results = [...ORDERS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (status) {
    results = results.filter((o) => o.status === status);
  }

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return delay({
    items,
    pagination: { total, totalPages, page: safePage },
  });
}
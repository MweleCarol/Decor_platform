import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

export interface RecentOrder {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user?: { fullName: string; email: string };
  guestEmail?: string;
  items: Array<{ product: { name: string } }>;
}

export interface TopProduct {
  productId: string;
  _sum: { quantity: number };
  product?: { id: string; name: string; basePrice: number };
}

export function useAnalytics() {
  return useQuery<{ analytics: AnalyticsData }>({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/analytics");
      return data;
    },
    refetchInterval: 1000 * 60, // refresh every minute
  });
}

export interface AdminOrder {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user?: { fullName: string; email: string };
  guestEmail?: string;
  guestName?: string;
  items: Array<{
    quantity: number;
    unitPrice: number;
    product: { name: string };
    variant?: { color?: string; size?: string };
  }>;
}

export function useAdminOrders(page = 1, status?: string) {
  return useQuery<{
    items: AdminOrder[];
    pagination: { total: number; totalPages: number; page: number };
  }>({
    queryKey: ["admin", "orders", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status) params.set("status", status);
      const { data } = await api.get(`/api/orders/admin/all?${params}`);
      return data;
    },
  });
}

export function useAdminUsers(page = 1) {
  return useQuery({
    queryKey: ["admin", "users", page],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/users?page=${page}`);
      return data;
    },
  });
}
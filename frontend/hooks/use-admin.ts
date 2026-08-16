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

export interface AdminDesign {
  id: string;
  status: string;
  user?: { fullName: string; email: string };
  roomType: string;
  originalImageUrl?: string;
  generatedImageUrl?: string;
  estimatedCost?: number;
  recommendedProductIds?: string[];
  colorPalette?: string[];
  stylePrompt?: string;
  createdAt: string;
}

export function useAdminDesigns() {
  return useQuery<{ designs: AdminDesign[] }>({
    queryKey: ["admin", "designs"],
    queryFn: async () => {
      if (USE_MOCK) {
        const { getMockDesigns } = await import("@/mock/designs");
        return getMockDesigns();
      }
      const { data } = await api.get("/api/admin/designs");
      return data;
    },
  });
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
      if (USE_MOCK) {
        const { getMockAnalytics } = await import("@/mock/analytics");
        return getMockAnalytics();
      }
      const { data } = await api.get("/api/admin/analytics");
      return data;
    },
    refetchInterval: USE_MOCK ? false : 1000 * 60, // no point polling static mock data
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
    productId?: string;
    quantity: number;
    unitPrice: number;
    product: { name: string };
    variant?: { color?: string; size?: string };
  }>;
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function useAdminOrders(page = 1, status?: string) {
  return useQuery<{
    items: AdminOrder[];
    pagination: { total: number; totalPages: number; page: number };
  }>({
    queryKey: ["admin", "orders", page, status],
    queryFn: async () => {
      if (USE_MOCK) {
        const { getMockOrders } = await import("@/mock/orders");
        return getMockOrders({ page, status, pageSize: 20 });
      }
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
      if (USE_MOCK) {
        const { getMockUsers } = await import("@/mock/customers");
        return getMockUsers({ page, pageSize: 20 });
      }
      const { data } = await api.get(`/api/admin/users?page=${page}`);
      return data;
    },
  });
}


export interface AdminConversation {
  id: string;
  lastMessageAt: string;
  customer: { id: string; fullName: string; email: string; avatarUrl?: string };
  messages: Array<{ id: string; content?: string; createdAt: string }>;
}

export function useAdminConversations() {
  return useQuery<{ conversations: AdminConversation[] }>({
    queryKey: ["admin", "conversations"],
    queryFn: async () => {
      if (USE_MOCK) {
        const { getMockConversations } = await import("@/mock/chat");
        return getMockConversations();
      }
      const { data } = await api.get("/api/chat/conversations");
      return data;
    },
    refetchInterval: USE_MOCK ? false : 10000, // no point polling static mock data
  });
}
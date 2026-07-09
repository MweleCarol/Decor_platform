import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useOrders(page = 1, status?: string) {
  return useQuery({
    queryKey: ["orders", page, status],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (status) p.set("status", status);
      const { data } = await api.get(`/api/orders?${p}`);
      return data;
    },
  });
}

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    enabled:  !!orderId,
    queryFn: async () => {
      const { data } = await api.get(`/api/orders/${orderId}`);
      return data.order;
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        county?: string;
        postalCode?: string;
        country?: string;
      };
      guestEmail?: string;
      guestName?: string;
      guestItems?: Array<{ productId: string; variantId?: string; quantity: number }>;
    }) => {
      const { data } = await api.post("/api/orders/checkout", payload);
      return data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
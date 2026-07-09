import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "@/components/ui/toast";

// ── AI Designer ───────────────────────────────────────────────────────────────

export function useDesigns() {
  return useQuery({
    queryKey: ["designs"],
    queryFn: async () => {
      const { data } = await api.get("/api/ai/designer");
      return data.designs;
    },
  });
}

export function useDesign(id: string | null, refetchInterval?: number) {
  return useQuery({
    queryKey: ["design", id],
    enabled:  !!id,
    refetchInterval,
    queryFn: async () => {
      const { data } = await api.get(`/api/ai/designer/${id}`);
      return data.design;
    },
  });
}

export function useCreateDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post("/api/ai/designer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.design;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to create design");
    },
  });
}

export function useAddDesignToCart(designId: string) {
  return useMutation({
    mutationFn: async () => {
      await api.post(`/api/ai/designer/${designId}/add-to-cart`);
    },
    onSuccess: () => toast.success("Recommended products added to cart"),
    onError:   () => toast.error("Failed to add products to cart"),
  });
}

// ── AI Customizer ─────────────────────────────────────────────────────────────

export function useCustomProducts() {
  return useQuery({
    queryKey: ["custom-products"],
    queryFn: async () => {
      const { data } = await api.get("/api/ai/customizer");
      return data.records;
    },
  });
}

export function useCustomProduct(id: string | null, refetchInterval?: number) {
  return useQuery({
    queryKey: ["custom-product", id],
    enabled:  !!id,
    refetchInterval,
    queryFn: async () => {
      const { data } = await api.get(`/api/ai/customizer/${id}`);
      return data.record;
    },
  });
}

export function useCreateCustomProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      productType: string;
      fabric?: string;
      pattern?: string;
      color?: string;
      measurements?: { width: number; height: number; unit: string };
      styleDescription?: string;
    }) => {
      const { data } = await api.post("/api/ai/customizer", input);
      return data.record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-products"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to generate product");
    },
  });
}

// ── AI Chat Assistant ─────────────────────────────────────────────────────────

export function useAIMessage() {
  return useMutation({
    mutationFn: async ({
      message,
      history,
    }: {
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    }) => {
      const { data } = await api.post("/api/ai/assistant/message", { message, history });
      return data.reply as string;
    },
  });
}

export function useEscalateToHuman() {
  return useMutation({
    mutationFn: async (summary: string) => {
      const { data } = await api.post("/api/ai/assistant/escalate", { summary });
      return data;
    },
    onSuccess: () => toast.success("Conversation handed to our team"),
    onError:   () => toast.error("Please sign in to chat with our team"),
  });
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import {
  getMockProducts,
  getMockProductBySlug,
  getMockCategories,
} from "@/mock/product";


const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function useProducts(params: {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      if (USE_MOCK) {
        return getMockProducts(params as any);
      }
      const p = new URLSearchParams();
      if (params.search)   p.set("search",   params.search);
      if (params.category) p.set("category", params.category);
      if (params.sort)     p.set("sort",     params.sort);
      if (params.page)     p.set("page",     String(params.page));
      if (params.pageSize) p.set("pageSize", String(params.pageSize));
      const { data } = await api.get(`/api/products?${p}`);
      return data;
    },
  });
}

export function useProduct(slug: string | null) {
  return useQuery({
    queryKey: ["product", slug],
    enabled:  !!slug,
    queryFn: async () => {
      if (USE_MOCK) {
        return getMockProductBySlug(slug!);
      }
      const { data } = await api.get(`/api/products/${slug}`);
      return data.product;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (USE_MOCK) {
        return getMockCategories();
      }
      const { data } = await api.get("/api/categories");
      return data.categories;
    },
    staleTime: 1000 * 60 * 10, // categories rarely change
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { rating: number; comment?: string }) => {
      if (USE_MOCK) {
        // No persistence layer for mock reviews yet — resolves without
        // mutating PRODUCTS, so the new review won't appear on refetch.
        // Flag if you want this to actually persist in-memory.
        return { success: true, mocked: true };
      }
      const { data } = await api.post(`/api/products/${productId}/reviews`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
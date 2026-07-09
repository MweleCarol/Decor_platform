import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

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
      const { data } = await api.get(`/api/products/${slug}`);
      return data.product;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
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
      const { data } = await api.post(`/api/products/${productId}/reviews`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
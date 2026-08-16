import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { mockBuildWishlistItem } from "@/mock/wishlist";
import type { Product } from "@/mock/products";

export interface WishlistItem {
  id: string;
  product: Pick<Product, "id" | "slug" | "name" | "basePrice" | "images" | "category" | "variants">;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchWishlist: async () => {
        // Mock items are already persisted locally via the store itself —
        // nothing to fetch from a "server."
        if (USE_MOCK) return;
        set({ isLoading: true });
        try {
          const { data } = await api.get("/api/wishlist");
          set({ items: data.items });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (productId) => {
        if (get().isWishlisted(productId)) return;

        if (USE_MOCK) {
          if (!useAuthStore.getState().user) {
            throw new Error("Please log in to save items");
          }
          const item = await mockBuildWishlistItem(productId);
          set((s) => ({ items: [...s.items, item] }));
          return;
        }

        await api.post("/api/wishlist", { productId });
        await get().fetchWishlist();
      },

      removeItem: async (productId) => {
        if (USE_MOCK) {
          set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) }));
          return;
        }
        await api.delete(`/api/wishlist/${productId}`);
        await get().fetchWishlist();
      },

      isWishlisted: (productId) => get().items.some((i) => i.product.id === productId),
    }),
    {
      name: "decor-wishlist",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
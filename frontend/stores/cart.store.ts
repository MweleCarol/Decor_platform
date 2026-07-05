import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api-client";

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    name: string;
    basePrice: number;
    images: { url: string }[];
  };
  variant?: {
    color?: string;
    size?: string;
    priceDelta: number;
  };
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  isOpen: boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      isOpen: false,
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/api/cart");
          set({ items: data.items, subtotal: parseFloat(data.subtotal) });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (productId, variantId, quantity = 1) => {
        const { data } = await api.post("/api/cart", { productId, variantId, quantity });
        await get().fetchCart();
        set({ isOpen: true });
      },

      updateItem: async (itemId, quantity) => {
        await api.patch(`/api/cart/${itemId}`, { quantity });
        await get().fetchCart();
      },

      removeItem: async (itemId) => {
        await api.delete(`/api/cart/${itemId}`);
        await get().fetchCart();
      },

      clearCart: async () => {
        await api.delete("/api/cart");
        set({ items: [], subtotal: 0 });
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "decor-cart",
      partialize: (state) => ({ items: state.items, subtotal: state.subtotal }),
    }
  )
);
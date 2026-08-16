import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { mockBuildCartItem, computeSubtotal } from "@/mock/cart";

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

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// Only auto-pop the drawer on desktop widths — on mobile, cart now
// lives on its own page (see navbar's bottom pill), so yanking a
// drawer open mid-browse there would fight that navigation model.
function isDesktopViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      isOpen: false,
      isLoading: false,

      fetchCart: async () => {
        if (USE_MOCK) return; // mock cart is already persisted locally
        set({ isLoading: true });
        try {
          const { data } = await api.get("/api/cart");
          set({ items: data.items, subtotal: parseFloat(data.subtotal) });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (productId, variantId, quantity = 1) => {
        if (USE_MOCK) {
          if (!useAuthStore.getState().user) {
            throw new Error("Please log in to add items to cart");
          }
          const newItem = await mockBuildCartItem(productId, variantId, quantity);
          const existing = get().items.find(
            (i) => i.productId === productId && i.variantId === variantId
          );

          const items = existing
            ? get().items.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...get().items, newItem];

          set({ items, subtotal: computeSubtotal(items) });
        } else {
          await api.post("/api/cart", { productId, variantId, quantity });
          await get().fetchCart();
        }

        if (isDesktopViewport()) set({ isOpen: true });
      },

      updateItem: async (itemId, quantity) => {
        if (USE_MOCK) {
          const items = get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
          set({ items, subtotal: computeSubtotal(items) });
          return;
        }
        await api.patch(`/api/cart/${itemId}`, { quantity });
        await get().fetchCart();
      },

      removeItem: async (itemId) => {
        if (USE_MOCK) {
          const items = get().items.filter((i) => i.id !== itemId);
          set({ items, subtotal: computeSubtotal(items) });
          return;
        }
        await api.delete(`/api/cart/${itemId}`);
        await get().fetchCart();
      },

      clearCart: async () => {
        if (USE_MOCK) {
          set({ items: [], subtotal: 0 });
          return;
        }
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
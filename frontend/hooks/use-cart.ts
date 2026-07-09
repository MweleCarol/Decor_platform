import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";

// Thin wrapper that auto-fetches the cart when user is logged in
export function useCart() {
  const { user }    = useAuthStore();
  const cart        = useCartStore();

  useEffect(() => {
    if (user) cart.fetchCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    items:      cart.items,
    subtotal:   cart.subtotal,
    isLoading:  cart.isLoading,
    isOpen:     cart.isOpen,
    itemCount:  cart.itemCount(),
    addItem:    cart.addItem,
    updateItem: cart.updateItem,
    removeItem: cart.removeItem,
    clearCart:  cart.clearCart,
    toggleCart: cart.toggleCart,
    fetchCart:  cart.fetchCart,
  };
}
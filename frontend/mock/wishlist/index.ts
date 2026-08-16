import { PRODUCTS } from "@/mock/product";

const MOCK_DELAY_MS = 300;
function delay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Builds a wishlist entry from a product id, mirroring the shape the
 * real /api/wishlist endpoint would return. Actual wishlist membership
 * is tracked by the zustand store itself (persisted to localStorage) —
 * this just constructs the item to add.
 */
export async function mockBuildWishlistItem(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) throw new Error("Product not found");
  return delay({ id: `wish-${productId}`, product });
}
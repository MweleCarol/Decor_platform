import { PRODUCTS } from "@/mock/product";

const MOCK_DELAY_MS = 300;
function delay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

interface BuiltCartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: { name: string; basePrice: number; images: { url: string }[] };
  variant?: { color?: string; size?: string; priceDelta: number };
}

/**
 * Mirrors what POST /api/cart would build server-side: resolves the
 * product (and variant, if given) and returns a cart-line-item shape.
 */
export async function mockBuildCartItem(
  productId: string,
  variantId?: string,
  quantity: number = 1
): Promise<BuiltCartItem> {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) throw new Error("Product not found");

  const variant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : undefined;
  if (variantId && !variant) throw new Error("Variant not found");

  return delay({
    id: `cart-${productId}${variantId ? `-${variantId}` : ""}`,
    productId,
    variantId,
    quantity,
    product: {
      name: product.name,
      basePrice: product.basePrice,
      images: product.images,
    },
    variant: variant
      ? { color: variant.color, size: variant.size, priceDelta: variant.priceDelta }
      : undefined,
  });
}

export function computeSubtotal(items: BuiltCartItem[]): number {
  return items.reduce((sum, item) => {
    const unitPrice = Number(item.product.basePrice) + (item.variant ? Number(item.variant.priceDelta) : 0);
    return sum + unitPrice * item.quantity;
  }, 0);
}
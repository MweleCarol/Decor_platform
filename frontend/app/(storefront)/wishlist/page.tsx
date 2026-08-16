"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

import { useWishlistStore } from "@/stores/wishlist.store";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const { items, isLoading, fetchWishlist, removeItem } = useWishlistStore();

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  async function handleRemove(productId: string) {
    try {
      await removeItem(productId);
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Something went wrong");
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Heart size={48} className="text-stone-300 mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-3">
          Your Wishlist
        </h1>
        <p className="text-stone-500 mb-6">Sign in to save items you love.</p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl font-bold text-stone-900">
            Wishlist
          </h1>
          <p className="text-stone-500 mt-1">{items.length} saved items</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <Heart size={48} className="text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-6">No saved items yet</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item: any) => {
            const image = item.product.images[0];
            const inStock = item.product.variants.some((v: any) => v.stock > 0);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden group"
              >
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="block w-full h-full"
                  >
                    {image && (
                      <Image
                        src={image.url}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </Link>

                  {/* Remove — floating overlay, always visible, no hover dependency */}
                  <button
                    onClick={() => handleRemove(item.product.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-stone-500 hover:text-red-500 hover:bg-white flex items-center justify-center shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-3 sm:p-4">
                  <p className="text-xs text-stone-400">
                    {item.product.category.name}
                  </p>
                  <Link href={`/products/${item.product.slug}`}>
                    <p className="text-sm font-semibold text-stone-800 mt-0.5 line-clamp-2 hover:text-gold-600 transition-colors">
                      {item.product.name}
                    </p>
                  </Link>
                  <p className="text-base font-bold text-stone-900 mt-2">
                    {formatCurrency(Number(item.product.basePrice))}
                  </p>

                  {/* Add to Cart — full width, no more sharing the row */}
                  <button
                    onClick={async () => {
                      try {
                        await addItem(item.product.id);
                        toast.success("Added to cart");
                      } catch {
                        toast.error("Please log in");
                      }
                    }}
                    disabled={!inStock}
                    aria-label={inStock ? "Add to cart" : "Out of stock"}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
                  >
                    <ShoppingCart size={12} />
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

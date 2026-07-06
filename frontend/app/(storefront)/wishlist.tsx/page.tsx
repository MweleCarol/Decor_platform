"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const { user }        = useAuthStore();
  const { addItem }     = useCartStore();
  const queryClient     = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    enabled:  !!user,
    queryFn: async () => {
      const { data } = await api.get("/api/wishlist");
      return data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
  });

  const items = data?.items ?? [];

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Heart size={48} className="text-stone-300 mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-3">Your Wishlist</h1>
        <p className="text-stone-500 mb-6">Sign in to save items you love.</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl font-bold text-stone-900">Wishlist</h1>
          <p className="text-stone-500 mt-1">{items.length} saved items</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <Heart size={48} className="text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-6">No saved items yet</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item: any) => {
            const image = item.product.images[0];
            const inStock = item.product.variants.some((v: any) => v.stock > 0);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden group">
                <Link href={`/products/${item.product.slug}`}>
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    {image && (
                      <Image
                        src={image.url}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-stone-400">{item.product.category.name}</p>
                  <Link href={`/products/${item.product.slug}`}>
                    <p className="text-sm font-semibold text-stone-800 mt-0.5 line-clamp-2 hover:text-gold-600 transition-colors">
                      {item.product.name}
                    </p>
                  </Link>
                  <p className="text-base font-bold text-stone-900 mt-2">
                    {formatCurrency(Number(item.product.basePrice))}
                  </p>
                  <div className="flex gap-2 mt-3">
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
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 transition-colors"
                    >
                      <ShoppingCart size={12} />
                      {inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                    <button
                      onClick={() => removeMutation.mutate(item.product.id)}
                      className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-200 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import { api } from "@/lib/api-client";
import { toast } from "@/components/ui/toast";
import { formatCurrency, cn } from "@/lib/utils";

interface Product {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isFeatured: boolean;
  category: { name: string };
  images: { url: string; altText?: string }[];
  variants: { stock: number }[];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();

  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const inStock    = totalStock > 0;
  const image      = product.images[0];

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!inStock) return;
    setAddingToCart(true);
    try {
      await addItem(product.id);
      toast.success("Added to cart");
    } catch {
      toast.error("Please log in to add items to cart");
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    try {
      if (wishlisted) {
        await api.delete(`/api/wishlist/${product.id}`);
        setWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post("/api/wishlist", { productId: product.id });
        setWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Please log in to save items");
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-shadow hover:shadow-lg">

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart size={32} className="text-stone-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isBestSeller && (
              <span className="bg-gold-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Best Seller
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Featured
              </span>
            )}
            {!inStock && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
              "opacity-0 group-hover:opacity-100",
              wishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 text-stone-500 hover:text-red-500"
            )}
          >
            <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
          </button>

          {/* Add to cart overlay */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || addingToCart}
            className={cn(
              "absolute bottom-0 left-0 right-0 py-3 text-sm font-medium transition-all duration-300",
              "translate-y-full group-hover:translate-y-0",
              inStock
                ? "bg-stone-900 text-white hover:bg-stone-800"
                : "bg-stone-300 text-stone-500 cursor-not-allowed"
            )}
          >
            {addingToCart ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-stone-400 mb-1">{product.category.name}</p>
          <p className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug">
            {product.name}
          </p>

          <div className="flex items-center justify-between mt-2.5">
            <p className="text-base font-bold text-stone-900">
              {formatCurrency(Number(product.basePrice))}
            </p>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1">
                <Star size={11} className="text-gold-500 fill-gold-400" />
                <span className="text-xs text-stone-500">
                  {Number(product.rating).toFixed(1)} ({product.reviewCount})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
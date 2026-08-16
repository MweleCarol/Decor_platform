"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import { toast } from "@/components/ui/toast";
import { formatCurrency, cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist.store";

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
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();

  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const inStock = totalStock > 0;
  const image = product.images[0];
  const {
    isWishlisted,
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
  } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!inStock || addingToCart) return;
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
        await removeWishlistItem(product.id);
        toast.success("Removed from wishlist");
      } else {
        await addWishlistItem(product.id);
        toast.success("Added to wishlist");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Please log in to save items");
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
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
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

          {/* Wishlist — always visible on mobile (no hover), hover-reveal on desktop */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className={cn(
              "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
              "opacity-100 md:opacity-0 md:group-hover:opacity-100",
              wishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 text-stone-500 hover:text-red-500",
            )}
          >
            <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
          </button>

          {/* Mobile: small floating add-to-cart icon (no hover dependency) */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || addingToCart}
            aria-label={inStock ? "Add to cart" : "Out of stock"}
            className={cn(
              "md:hidden absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-modal transition-transform active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
              inStock
                ? "bg-stone-900 text-white"
                : "bg-stone-300 text-stone-500",
            )}
          >
            <ShoppingCart size={16} />
          </button>

          {/* Desktop: full-width reveal-on-hover bar (mouse users get real hover) */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || addingToCart}
            className={cn(
              "hidden md:block absolute bottom-0 left-0 right-0 py-3 text-sm font-medium transition-all duration-300",
              "translate-y-full group-hover:translate-y-0",
              inStock
                ? "bg-stone-900 text-white hover:bg-stone-800"
                : "bg-stone-300 text-stone-500 cursor-not-allowed",
            )}
          >
            {addingToCart
              ? "Adding…"
              : inStock
                ? "Add to Cart"
                : "Out of Stock"}
          </button>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4">
          <p className="text-xs text-stone-400 mb-1">{product.category.name}</p>
          <p className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug">
            {product.name}
          </p>

          <div className="flex items-center justify-between mt-2.5 gap-2">
            <p className="text-base font-bold text-stone-900">
              {formatCurrency(Number(product.basePrice))}
            </p>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 shrink-0">
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

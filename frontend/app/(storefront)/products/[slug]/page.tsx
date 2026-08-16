"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useProduct } from "@/hooks/use-products";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCartStore();

  const { data: product, isLoading } = useProduct(slug);

  const uniqueColors = product
    ? ([
        ...new Set(product.variants.map((v: any) => v.color).filter(Boolean)),
      ] as string[])
    : [];
  const uniqueSizes = product
    ? ([
        ...new Set(product.variants.map((v: any) => v.size).filter(Boolean)),
      ] as string[])
    : [];

  const activeVariant = product?.variants.find(
    (v: any) => v.id === selectedVariant,
  );
  const totalPrice = product
    ? Number(product.basePrice) +
      (activeVariant ? Number(activeVariant.priceDelta) : 0)
    : 0;
  const inStock = activeVariant
    ? activeVariant.stock > 0
    : product?.variants.some((v: any) => v.stock > 0);

  async function handleAddToCart() {
    try {
      await addItem(product.id, selectedVariant, quantity);
      toast.success("Added to cart");
    } catch {
      toast.error("Please log in to add items to cart");
    }
  }

  async function handleWishlist() {
    try {
      if (wishlisted) {
        await api.delete(`/api/wishlist/${product.id}`);
        setWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post("/api/wishlist", { productId: product.id });
        setWishlisted(true);
        toast.success("Saved to wishlist");
      }
    } catch {
      toast.error("Please log in");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-${[4, 8, 4, 6, 4, 12][i]} rounded-lg`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-stone-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100">
            {product.images[selectedImage] && (
              <Image
                src={product.images[selectedImage].url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden border-2 transition-colors",
                    selectedImage === i
                      ? "border-gold-500"
                      : "border-transparent",
                  )}
                >
                  <Image
                    src={img.url}
                    alt={`View ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-stone-400 mb-1">
              {product.category.name}
            </p>
            <h1 className="font-display text-3xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(Number(product.rating))
                          ? "text-gold-500 fill-gold-400"
                          : "text-stone-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-stone-500">
                  {Number(product.rating).toFixed(1)} ({product.reviewCount}{" "}
                  reviews)
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <p className="text-3xl font-bold text-stone-900">
            {formatCurrency(totalPrice)}
          </p>

          {/* Description */}
          <p className="text-stone-600 leading-relaxed">
            {product.description}
          </p>

          {/* Material */}
          {product.material && (
            <p className="text-sm text-stone-500">
              <span className="font-medium text-stone-700">Material:</span>{" "}
              {product.material}
            </p>
          )}

          {/* Color selector */}
          {uniqueColors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      const v = product.variants.find(
                        (v: any) => v.color === color,
                      );
                      if (v) setSelectedVariant(v.id);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                      activeVariant?.color === color
                        ? "border-gold-500 bg-gold-50 text-gold-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-400",
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {uniqueSizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Size</p>
              <div className="flex gap-2 flex-wrap">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      const v = product.variants.find(
                        (v: any) => v.size === size,
                      );
                      if (v) setSelectedVariant(v.id);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                      activeVariant?.size === size
                        ? "border-gold-500 bg-gold-50 text-gold-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-400",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + CTA */}
          {/* Quantity + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-between gap-3 sm:contents">
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-11 h-11 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Wishlist — sits beside quantity on mobile only */}
              <button
                onClick={handleWishlist}
                aria-label={
                  wishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                aria-pressed={wishlisted}
                className={cn(
                  "sm:hidden w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center transition-colors",
                  wishlisted
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-400",
                )}
              >
                <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1 w-full sm:w-auto"
              disabled={!inStock}
              icon={<ShoppingCart size={16} />}
              onClick={handleAddToCart}
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>

            {/* Wishlist — sits at the end of the row on sm+ */}
            <button
              onClick={handleWishlist}
              aria-label={
                wishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              aria-pressed={wishlisted}
              className={cn(
                "hidden sm:flex w-11 h-11 shrink-0 rounded-xl border items-center justify-center transition-colors",
                wishlisted
                  ? "border-red-400 bg-red-50 text-red-500"
                  : "border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-400",
              )}
            >
              <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              {
                icon: <Truck size={15} />,
                label: "Free Delivery",
                sub: "Orders over KES 5,000",
              },
              {
                icon: <Shield size={15} />,
                label: "Quality Guarantee",
                sub: "30-day returns",
              },
              {
                icon: <RotateCcw size={15} />,
                label: "Easy Returns",
                sub: "Hassle-free process",
              },
            ].map(({ icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-3 bg-stone-50 rounded-xl"
              >
                <span className="text-gold-500 mb-1">{icon}</span>
                <p className="text-xs font-semibold text-stone-700">{label}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">
            Customer Reviews
          </h2>
          <div className="grid gap-4">
            {product.reviews.map((review: any) => (
              <div
                key={review.id}
                className="bg-white border border-stone-200 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-700 text-xs font-bold flex items-center justify-center">
                      {review.user.fullName.charAt(0)}
                    </div>
                    <p className="text-sm font-medium text-stone-800">
                      {review.user.fullName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < review.rating
                            ? "text-gold-500 fill-gold-400"
                            : "text-stone-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-stone-600">{review.comment}</p>
                )}
                <p className="text-xs text-stone-400 mt-2">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductPreviewCardProps {
  name: string;
  categoryName: string;
  basePrice: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  images: { url: string; altText?: string }[];
}

export function ProductPreviewCard({
  name,
  categoryName,
  basePrice,
  isFeatured,
  isBestSeller,
  images,
}: ProductPreviewCardProps) {
  const image = images[0];

  return (
    <div className="w-full max-w-[220px]">
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {image ? (
            <Image src={image.url} alt={image.altText ?? name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart size={28} className="text-stone-300" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isBestSeller && (
              <span className="bg-gold-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Best Seller
              </span>
            )}
            {isFeatured && (
              <span className="bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Featured
              </span>
            )}
          </div>

          {/* Static — this is a preview, not a real interactive card */}
          <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-stone-400 flex items-center justify-center">
            <Heart size={15} />
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <p className="text-xs text-stone-400 mb-1">{categoryName || "Uncategorized"}</p>
          <p className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug">
            {name || "Untitled Product"}
          </p>
          <div className="flex items-center justify-between mt-2.5 gap-2">
            <p className="text-base font-bold text-stone-900">
              {basePrice ? formatCurrency(basePrice) : "KES —"}
            </p>
            <div className="flex items-center gap-1 shrink-0 text-stone-300">
              <Star size={11} />
              <span className="text-xs">New</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-stone-400 text-center mt-2">
        Live preview — how this will appear in the catalog
      </p>
    </div>
  );
}
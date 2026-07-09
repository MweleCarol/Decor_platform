"use client";

import Image from "next/image";
import { ShoppingCart, Share2, Download, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { api } from "@/lib/api-client";
import { toast } from "@/components/ui/toast";

interface Design {
  id: string;
  status: string;
  roomType: string;
  stylePrompt?: string;
  originalImageUrl: string;
  generatedImageUrl?: string;
  colorPalette?: string[];
  estimatedCost?: number;
  recommendedProductIds: string[];
}

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  category: { name: string };
  images: { url: string }[];
}

interface DesignerResultProps {
  design: Design;
  products: RecommendedProduct[];
  onReset: () => void;
}

export function DesignerResult({ design, products, onReset }: DesignerResultProps) {
  const { fetchCart } = useCartStore();

  async function addAllToCart() {
    try {
      await api.post(`/api/ai/designer/${design.id}/add-to-cart`);
      await fetchCart();
      toast.success("All recommended products added to cart!");
    } catch {
      toast.error("Please log in to add items to cart");
    }
  }

  if (design.status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gold-200" />
          <div className="absolute inset-0 rounded-full border-4 border-gold-500 border-t-transparent animate-spin" />
          <Sparkles size={20} className="absolute inset-0 m-auto text-gold-500" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-stone-800">Designing your room…</p>
          <p className="text-sm text-stone-400 mt-1">
            Our AI is analysing your space and generating a mockup. This takes about 30 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (design.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-stone-500">The design generation failed. Please try again.</p>
        <Button variant="outline" onClick={onReset} icon={<RefreshCw size={14} />}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Image comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Original
          </p>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-100">
            <Image src={design.originalImageUrl} alt="Original room" fill className="object-cover" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gold-500 uppercase tracking-wide mb-2">
            AI Redesign ✦
          </p>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-100">
            {design.generatedImageUrl ? (
              <Image src={design.generatedImageUrl} alt="AI redesign" fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Sparkles size={28} className="text-stone-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Colour palette */}
      {design.colorPalette && design.colorPalette.length > 0 && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">Suggested Palette</p>
          <div className="flex gap-2">
            {design.colorPalette.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-xl border border-stone-200 shadow-sm"
                  style={{ background: color }}
                />
                <p className="text-[10px] text-stone-400">{color}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost estimate */}
      {design.estimatedCost && (
        <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-stone-600">Estimated total for this look</p>
          <p className="font-bold text-gold-700 text-xl">{formatCurrency(Number(design.estimatedCost))}</p>
        </div>
      )}

      {/* Recommended products */}
      {products.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-stone-800">Recommended Products</p>
            <Button
              size="sm"
              icon={<ShoppingCart size={13} />}
              onClick={addAllToCart}
            >
              Add All to Cart
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <a
                key={p.id}
                href={`/products/${p.slug}`}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-square bg-stone-100 overflow-hidden">
                  {p.images[0] && (
                    <Image
                      src={p.images[0].url}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-stone-400">{p.category.name}</p>
                  <p className="text-sm font-medium text-stone-800 line-clamp-1 mt-0.5">{p.name}</p>
                  <p className="text-sm font-bold text-stone-900 mt-1">{formatCurrency(Number(p.basePrice))}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onReset} icon={<RefreshCw size={14} />}>
          New Design
        </Button>
        {design.generatedImageUrl && (
          <a href={design.generatedImageUrl} download target="_blank" rel="noreferrer">
            <Button variant="outline" icon={<Download size={14} />}>
              Save Image
            </Button>
          </a>
        )}
        <Button
          variant="outline"
          icon={<Share2 size={14} />}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied!");
          }}
        >
          Share
        </Button>
      </div>
    </div>
  );
}
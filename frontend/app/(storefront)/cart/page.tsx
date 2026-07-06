"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { user }  = useAuthStore();
  const { items, subtotal, isLoading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => { if (user) fetchCart(); }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingCart size={48} className="text-stone-300 mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-3">Your Cart</h1>
        <p className="text-stone-500 mb-6">Please sign in to view your cart.</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-bold text-stone-900 mb-10">Your Cart</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-5 p-5 bg-white rounded-2xl border border-stone-200">
              <Skeleton className="w-24 h-24 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-8 w-28 mt-3" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingCart size={48} className="text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-6">Your cart is empty</p>
          <Link href="/products"><Button>Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const unitPrice = Number(item.product.basePrice) + (item.variant ? Number(item.variant.priceDelta) : 0);
              const image = item.product.images[0];

              return (
                <div key={item.id} className="flex gap-5 p-5 bg-white rounded-2xl border border-stone-200">
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    {image && <Image src={image.url} alt={item.product.name} fill className="object-cover" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 leading-snug">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        {[item.variant.color, item.variant.size].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-gold-600 mt-1">
                      {formatCurrency(unitPrice)} each
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-9 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-stone-900">
                      {formatCurrency(unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24">
              <h2 className="font-semibold text-stone-800 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>{formatCurrency(Number(subtotal))}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600">Calculated at checkout</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-900">
                  <span>Total</span>
                  <span>{formatCurrency(Number(subtotal))}</span>
                </div>
              </div>
              <Link href="/checkout" className="block mt-6">
                <Button className="w-full" size="lg" icon={<ArrowRight size={15} />}>
                  Checkout
                </Button>
              </Link>
              <Link href="/products" className="block mt-3 text-center text-sm text-stone-500 hover:text-stone-700">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
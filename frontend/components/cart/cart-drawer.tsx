"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";

export function CartDrawer() {
  const { items, subtotal, isOpen, isLoading, toggleCart, updateItem, removeItem, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && isOpen) fetchCart();
  }, [user, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={toggleCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white z-50 flex flex-col
          transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-stone-700" />
            <p className="font-semibold text-stone-800">Your Cart</p>
            {items.length > 0 && (
              <span className="text-xs bg-gold-100 text-gold-700 font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={toggleCart}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart size={40} className="text-stone-300" />
              <p className="text-stone-500 text-sm">Sign in to view your cart</p>
              <Link href="/login" onClick={toggleCart}>
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-16 h-16 bg-stone-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart size={40} className="text-stone-300" />
              <p className="text-stone-500 text-sm">Your cart is empty</p>
              <Link href="/products" onClick={toggleCart}>
                <Button size="sm" variant="outline">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const unitPrice = Number(item.product.basePrice) + (item.variant ? Number(item.variant.priceDelta) : 0);
                const image = item.product.images[0];

                return (
                  <div key={item.id} className="flex gap-3">
                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      {image && (
                        <Image src={image.url} alt={item.product.name} fill className="object-cover" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 line-clamp-1">
                        {item.product.name}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-stone-400">
                          {[item.variant.color, item.variant.size].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-stone-900 mt-0.5">
                        {formatCurrency(unitPrice)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 border border-stone-200 rounded-lg">
                          <button
                            onClick={() => item.quantity > 1
                              ? updateItem(item.id, item.quantity - 1)
                              : removeItem(item.id)
                            }
                            className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
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

        {/* Footer */}
        {items.length > 0 && user && (
          <div className="border-t border-stone-100 px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">Subtotal</p>
              <p className="font-bold text-stone-900">{formatCurrency(Number(subtotal))}</p>
            </div>
            <p className="text-xs text-stone-400">Shipping calculated at checkout</p>
            <Link href="/checkout" onClick={toggleCart} className="block">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>
            <Link href="/cart" onClick={toggleCart} className="block text-center text-sm text-stone-500 hover:text-stone-700">
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
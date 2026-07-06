"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { MapPin, User, Mail, CheckCircle } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router          = useRouter();
  const { user }        = useAuthStore();
  const { items, subtotal, clearCart } = useCartStore();
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [form, setForm] = useState({
    guestName:  "",
    guestEmail: "",
    line1:      "",
    line2:      "",
    city:       "",
    county:     "",
    postalCode: "",
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        shippingAddress: {
          line1:      form.line1,
          line2:      form.line2 || undefined,
          city:       form.city,
          county:     form.county || undefined,
          postalCode: form.postalCode || undefined,
          country:    "Kenya",
        },
        ...(!user && {
          guestName:  form.guestName,
          guestEmail: form.guestEmail,
          guestItems: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity:  i.quantity,
          })),
        }),
      };
      const { data } = await api.post("/api/orders/checkout", payload);
      return data;
    },
    onSuccess: (data) => {
      setOrderId(data.order.id);
      setDone(true);
      clearCart();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Checkout failed. Please try again.");
    },
  });

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-3">Order Placed!</h1>
        <p className="text-stone-500 mb-2">
          Thank you for your order. We'll be in touch shortly.
        </p>
        <p className="text-xs text-stone-400 font-mono mb-8">
          Order ID: #{orderId.slice(0, 8).toUpperCase()}
        </p>
        <div className="flex gap-3 justify-center">
          {user && (
            <Button variant="outline" onClick={() => router.push(`/orders/${orderId}`)}>
              Track Order
            </Button>
          )}
          <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-bold text-stone-900 mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Form */}
        <div className="lg:col-span-2 space-y-8">

          {/* Guest info (only shown if not logged in) */}
          {!user && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2 mb-5">
                <User size={16} className="text-gold-500" /> Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  value={form.guestName}
                  onChange={(e) => field("guestName", e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.guestEmail}
                  onChange={(e) => field("guestEmail", e.target.value)}
                  icon={<Mail size={14} />}
                />
              </div>
            </div>
          )}

          {/* Shipping address */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2 mb-5">
              <MapPin size={16} className="text-gold-500" /> Delivery Address
            </h2>
            <div className="space-y-4">
              <Input
                label="Street / Building"
                placeholder="e.g. 14 Kenyatta Avenue, Apt 3"
                value={form.line1}
                onChange={(e) => field("line1", e.target.value)}
              />
              <Input
                label="Apartment / Floor (optional)"
                placeholder="e.g. Floor 2"
                value={form.line2}
                onChange={(e) => field("line2", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City / Town"
                  placeholder="Nairobi"
                  value={form.city}
                  onChange={(e) => field("city", e.target.value)}
                />
                <Input
                  label="County"
                  placeholder="Nairobi County"
                  value={form.county}
                  onChange={(e) => field("county", e.target.value)}
                />
              </div>
              <Input
                label="Postal Code (optional)"
                placeholder="00100"
                value={form.postalCode}
                onChange={(e) => field("postalCode", e.target.value)}
              />
            </div>
          </div>

          {/* Payment placeholder */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-3">Payment</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              Payment via M-Pesa will be arranged after order confirmation.
              Our team will contact you with payment instructions.
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24">
            <h2 className="font-semibold text-stone-800 mb-5">Your Order</h2>

            <div className="space-y-3 mb-5">
              {items.map((item) => {
                const unitPrice = Number(item.product.basePrice) + (item.variant ? Number(item.variant.priceDelta) : 0);
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-600 truncate max-w-[180px]">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-stone-800 shrink-0">
                      {formatCurrency(unitPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(subtotal))}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>TBD</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-100">
                <span>Total</span>
                <span>{formatCurrency(Number(subtotal))}</span>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              size="lg"
              loading={checkoutMutation.isPending}
              disabled={items.length === 0 || !form.line1 || !form.city}
              onClick={() => checkoutMutation.mutate()}
            >
              Place Order
            </Button>
            <p className="text-xs text-stone-400 text-center mt-3">
              By placing an order you agree to our terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
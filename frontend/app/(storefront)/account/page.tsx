"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, MapPin, Lock, Plus, Star } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, OrderStatusBadge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const TABS = ["Profile", "Orders", "Addresses", "Security"];

export default function AccountPage() {
  const router        = useRouter();
  const { user, logout } = useAuthStore();
  const queryClient   = useQueryClient();
  const [tab, setTab] = useState("Profile");
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName ?? "", phone: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: "", line1: "", city: "", county: "", postalCode: "", isDefault: false });

  const { data: ordersData } = useQuery({
    queryKey: ["my-orders"],
    enabled:  !!user,
    queryFn: async () => { const { data } = await api.get("/api/orders"); return data; },
  });

  const { data: addrData } = useQuery({
    queryKey: ["my-addresses"],
    enabled:  !!user,
    queryFn: async () => { const { data } = await api.get("/api/users/me/addresses"); return data; },
  });

  const updateProfile = useMutation({
    mutationFn: async () => api.patch("/api/users/me", profileForm),
    onSuccess: () => toast.success("Profile updated"),
    onError:   () => toast.error("Failed to update profile"),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (pwForm.newPassword !== pwForm.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      await api.post("/api/users/me/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
    },
    onSuccess: async () => {
      toast.success("Password changed. Please sign in again.");
      await logout();
      router.push("/login");
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to change password"),
  });

  const addAddress = useMutation({
    mutationFn: async () => api.post("/api/users/me/addresses", addrForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      toast.success("Address added");
      setShowAddrForm(false);
      setAddrForm({ label: "", line1: "", city: "", county: "", postalCode: "", isDefault: false });
    },
    onError: () => toast.error("Failed to add address"),
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/users/me/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      toast.success("Address removed");
    },
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-stone-500 mb-4">Please sign in to view your account.</p>
        <Button onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-bold text-stone-900 mb-8">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200 mb-8">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-gold-500 text-gold-600"
                : "border-transparent text-stone-500 hover:text-stone-800"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "Profile" && (
        <div className="max-w-md space-y-5">
          <Input label="Full Name" value={profileForm.fullName}
            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
            icon={<User size={14} />}
          />
          <Input label="Email" value={user.email} disabled />
          <Input label="Phone" value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            placeholder="+254 700 000 000"
          />
          <Button loading={updateProfile.isPending} onClick={() => updateProfile.mutate()}>
            Save Changes
          </Button>
        </div>
      )}

      {/* Orders tab */}
      {tab === "Orders" && (
        <div className="space-y-4">
          {(ordersData?.items ?? []).length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Star size={36} className="mx-auto mb-3 text-stone-300" />
              <p>No orders yet</p>
            </div>
          ) : (
            (ordersData?.items ?? []).map((order: any) => (
              <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-xs text-stone-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item: any, i: number) => (
                    <p key={i} className="text-sm text-stone-600">
                      {item.product.name} × {item.quantity}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-400">{formatDate(order.createdAt)}</p>
                  <p className="font-bold text-stone-900">{formatCurrency(Number(order.totalAmount))}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Addresses tab */}
      {tab === "Addresses" && (
        <div className="space-y-4 max-w-2xl">
          {(addrData?.addresses ?? []).map((addr: any) => (
            <div key={addr.id} className="bg-white border border-stone-200 rounded-2xl p-5 flex items-start justify-between">
              <div className="flex gap-3">
                <MapPin size={16} className="text-gold-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-stone-800">{addr.label}</p>
                  <p className="text-sm text-stone-500">{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                  <p className="text-sm text-stone-500">{addr.city}{addr.county && `, ${addr.county}`}</p>
                  {addr.isDefault && <Badge variant="gold" className="mt-1">Default</Badge>}
                </div>
              </div>
              <button
                onClick={() => deleteAddress.mutate(addr.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}

          {showAddrForm ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Label" placeholder='e.g. "Home"'
                  value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} />
                <Input label="Street / Building" placeholder="123 Kenyatta Ave"
                  value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} />
                <Input label="City" placeholder="Nairobi"
                  value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
                <Input label="County" placeholder="Nairobi County"
                  value={addrForm.county} onChange={(e) => setAddrForm({ ...addrForm, county: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <Button loading={addAddress.isPending} onClick={() => addAddress.mutate()}>Save Address</Button>
                <Button variant="outline" onClick={() => setShowAddrForm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" icon={<Plus size={14} />} onClick={() => setShowAddrForm(true)}>
              Add Address
            </Button>
          )}
        </div>
      )}

      {/* Security tab */}
      {tab === "Security" && (
        <div className="max-w-md space-y-4">
          <Input label="Current Password" type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            icon={<Lock size={14} />}
          />
          <Input label="New Password" type="password" placeholder="Min. 8 characters"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
          />
          <Input label="Confirm New Password" type="password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
          />
          <Button loading={changePassword.isPending} onClick={() => changePassword.mutate()}>
            Change Password
          </Button>
        </div>
      )}
    </div>
  );
}
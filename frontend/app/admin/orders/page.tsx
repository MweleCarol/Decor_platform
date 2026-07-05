"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { useAdminOrders } from "@/hooks/use-admin";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUSES = ["ALL","PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

export default function AdminOrdersPage() {
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState<string | undefined>(undefined);
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminOrders(page, status);

  const updateStatus = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      await api.patch(`/api/orders/${id}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    },
  });

  const orders = (data?.items ?? []).filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.user?.fullName?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.guestEmail?.toLowerCase().includes(q)
    );
  });

  const pagination = data?.pagination;

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-display">Orders</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {pagination?.total ?? 0} total orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-stone-400" />
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s === "ALL" ? undefined : s); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                (s === "ALL" && !status) || status === s
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["Order ID","Customer","Items","Total","Status","Date","Update Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-stone-500 px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3.5 bg-stone-100 rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-stone-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <>
                      <tr
                        key={order.id}
                        className="hover:bg-stone-50 cursor-pointer transition-colors"
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      >
                        <td className="px-5 py-4 font-mono text-xs text-stone-500">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-stone-800">
                            {order.user?.fullName ?? order.guestName ?? "Guest"}
                          </p>
                          <p className="text-xs text-stone-400">
                            {order.user?.email ?? order.guestEmail}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-stone-600">
                          {order.items.length} item{order.items.length !== 1 && "s"}
                        </td>
                        <td className="px-5 py-4 font-semibold text-stone-800">
                          {formatCurrency(Number(order.totalAmount))}
                        </td>
                        <td className="px-5 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-4 text-xs text-stone-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus.mutate({ id: order.id, newStatus: e.target.value })
                            }
                            className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 cursor-pointer"
                          >
                            {STATUSES.filter((s) => s !== "ALL").map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>

                      {/* Expanded row — order line items */}
                      {expanded === order.id && (
                        <tr key={`${order.id}-expanded`} className="bg-stone-50">
                          <td colSpan={7} className="px-8 py-4">
                            <p className="text-xs font-semibold text-stone-600 mb-3 uppercase tracking-wide">
                              Order Items
                            </p>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm bg-white border border-stone-100 rounded-lg px-4 py-2.5"
                                >
                                  <div>
                                    <p className="font-medium text-stone-800">{item.product.name}</p>
                                    {item.variant && (
                                      <p className="text-xs text-stone-400">
                                        {[item.variant.color, item.variant.size]
                                          .filter(Boolean)
                                          .join(" · ")}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-stone-800 font-medium">
                                      {formatCurrency(Number(item.unitPrice))} × {item.quantity}
                                    </p>
                                    <p className="text-xs text-stone-400">
                                      {formatCurrency(Number(item.unitPrice) * item.quantity)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-stone-100">
              <p className="text-xs text-stone-500">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
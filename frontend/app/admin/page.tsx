"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { useAnalytics, useAdminOrders } from "@/hooks/use-admin";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderStatusChart } from "@/components/admin/order-status-chart";
import { TopProductsChart } from "@/components/admin/top-products-chart";
import { WeeklyOrdersChart } from "@/components/admin/weekly-orders-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Helpers to derive chart data from raw analytics ─────────────────────────

function buildMonthlyRevenue(orders: any[]) {
  const months: Record<string, { revenue: number; orders: number }> = {};
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = labels[d.getMonth()];
    if (!months[key]) months[key] = { revenue: 0, orders: 0 };
    months[key].revenue += Number(o.totalAmount);
    months[key].orders  += 1;
  });

  return labels
    .filter((l) => months[l])
    .map((month) => ({ month, ...months[month] }));
}

function buildStatusData(orders: any[]) {
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function buildWeeklyData(orders: any[]) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const counts: Record<string, { orders: number; revenue: number }> = {};
  days.forEach((d) => { counts[d] = { orders: 0, revenue: 0 }; });

  const now = Date.now();
  orders
    .filter((o) => now - new Date(o.createdAt).getTime() < 7 * 86400000)
    .forEach((o) => {
      const day = days[new Date(o.createdAt).getDay()];
      counts[day].orders  += 1;
      counts[day].revenue += Number(o.totalAmount);
    });

  return days.map((day) => ({ day, ...counts[day] }));
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  trend?: number;
  accent?: boolean;
}

function StatCard({ title, value, sub, icon, trend, accent }: StatCardProps) {
  return (
    <Card className={cn(accent && "border-gold-200 bg-gradient-to-br from-gold-50 to-white")}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              {title}
            </p>
            <p className={cn("text-2xl font-bold mt-1", accent ? "text-gold-700" : "text-stone-900")}>
              {value}
            </p>
            {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
          </div>
          <div className={cn(
            "p-2.5 rounded-xl",
            accent ? "bg-gold-100 text-gold-600" : "bg-stone-100 text-stone-600"
          )}>
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-3">
            <ArrowUpRight
              size={13}
              className={trend >= 0 ? "text-emerald-500" : "text-red-400 rotate-180"}
            />
            <span className={cn("text-xs font-medium", trend >= 0 ? "text-emerald-600" : "text-red-500")}>
              {Math.abs(trend)}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: analyticsRes, isLoading: analyticsLoading } = useAnalytics();
  const { data: ordersRes, isLoading: ordersLoading } = useAdminOrders(1);

  const analytics = analyticsRes?.analytics;
  const allOrders = ordersRes?.items ?? [];

  const monthlyData  = useMemo(() => buildMonthlyRevenue(allOrders), [allOrders]);
  const statusData   = useMemo(() => buildStatusData(allOrders), [allOrders]);
  const weeklyData   = useMemo(() => buildWeeklyData(allOrders), [allOrders]);
  const topProducts  = useMemo(() =>
    (analytics?.topProducts ?? []).map((tp) => ({
      name: tp.product?.name ?? "Unknown",
      units: tp._sum.quantity ?? 0,
    })),
    [analytics]
  );

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-display">Dashboard</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live data
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(Number(analytics?.totalRevenue ?? 0))}
          sub="All time, excl. cancelled"
          icon={<TrendingUp size={18} />}
          trend={12}
          accent
        />
        <StatCard
          title="Total Orders"
          value={String(analytics?.totalOrders ?? 0)}
          sub={`${analytics?.pendingOrders ?? 0} pending`}
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          title="Customers"
          value={String(analytics?.totalUsers ?? 0)}
          sub="Registered accounts"
          icon={<Users size={18} />}
        />
        <StatCard
          title="Products"
          value={String(analytics?.totalProducts ?? 0)}
          sub="Active listings"
          icon={<Package size={18} />}
        />
      </div>

      {/* Revenue chart + Order status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue & Orders</CardTitle>
              <div className="flex items-center gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-gold-500 rounded-full inline-block" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-stone-300 rounded-full inline-block" />
                  Orders
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <RevenueChart data={monthlyData} />
            ) : (
              <EmptyChart message="Revenue data will appear here as orders come in." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <OrderStatusChart data={statusData} />
            ) : (
              <EmptyChart message="Status distribution will appear once orders exist." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top products + Weekly orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <TopProductsChart data={topProducts} />
            ) : (
              <EmptyChart message="Top products will appear once orders exist." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyOrdersChart data={weeklyData} />
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-stone-100">
              <div>
                <p className="text-xs text-stone-500">This week</p>
                <p className="text-lg font-bold text-stone-900 mt-0.5">
                  {weeklyData.reduce((s, d) => s + d.orders, 0)} orders
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Revenue</p>
                <p className="text-lg font-bold text-gold-600 mt-0.5">
                  {formatCurrency(weeklyData.reduce((s, d) => s + d.revenue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <a
              href="/admin/orders"
              className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["Order ID","Customer","Items","Amount","Status","Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium text-stone-500 px-6 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {(analytics?.recentOrders ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-stone-400">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  (analytics?.recentOrders ?? []).map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors group">
                      <td className="px-6 py-3.5 font-mono text-xs text-stone-500">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-stone-800">
                          {order.user?.fullName ?? order.guestEmail ?? "Guest"}
                        </p>
                        <p className="text-xs text-stone-400">
                          {order.user?.email ?? ""}
                        </p>
                      </td>
                      <td className="px-6 py-3.5 text-stone-600 text-xs">
                        {order.items.map((i: any) => i.product.name).join(", ").slice(0, 40)}
                        {order.items.length > 1 && (
                          <span className="text-stone-400"> +{order.items.length - 1} more</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-stone-800">
                        {formatCurrency(Number(order.totalAmount))}
                      </td>
                      <td className="px-6 py-3.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-3.5 text-xs text-stone-400">
                        <span title={formatDate(order.createdAt)}>
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[280px] flex flex-col items-center justify-center gap-2">
      <Clock size={28} className="text-stone-300" />
      <p className="text-sm text-stone-400 text-center max-w-[200px]">{message}</p>
    </div>
  );
}
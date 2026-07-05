"use client";

import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell,
} from "recharts";
import { useAnalytics, useAdminOrders } from "@/hooks/use-admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CATEGORY_COLORS = ["#c9a84c","#daa83f","#e5c06a","#a8a29e","#78716c"];

function buildMonthly(orders: any[]) {
  const map: Record<string, { month: string; revenue: number; orders: number; avgOrder: number }> = {};
  orders.forEach((o) => {
    const m = MONTHS[new Date(o.createdAt).getMonth()];
    if (!map[m]) map[m] = { month: m, revenue: 0, orders: 0, avgOrder: 0 };
    map[m].revenue += Number(o.totalAmount);
    map[m].orders  += 1;
  });
  return MONTHS.filter((m) => map[m]).map((m) => ({
    ...map[m],
    avgOrder: map[m].orders > 0 ? Math.round(map[m].revenue / map[m].orders) : 0,
  }));
}

function buildCategoryRevenue(orders: any[]) {
  const map: Record<string, number> = {};
  orders.forEach((o) => {
    o.items?.forEach((item: any) => {
      const cat = item.product?.category?.name ?? "Other";
      map[cat] = (map[cat] ?? 0) + Number(item.unitPrice) * item.quantity;
    });
  });
  return Object.entries(map)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

function CustomTooltipRevenue({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-medium text-stone-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === "orders" ? p.value : formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data: analyticsRes, isLoading } = useAnalytics();
  const { data: ordersRes }               = useAdminOrders(1);

  const analytics  = analyticsRes?.analytics;
  const allOrders  = ordersRes?.items ?? [];

  const monthly         = useMemo(() => buildMonthly(allOrders), [allOrders]);
  const categoryRevenue = useMemo(() => buildCategoryRevenue(allOrders), [allOrders]);

  const conversionRate = analytics
    ? ((analytics.totalOrders / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)
    : "0";

  const avgOrderValue = analytics && analytics.totalOrders > 0
    ? Number(analytics.totalRevenue) / analytics.totalOrders
    : 0;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-display">Analytics</h1>
        <p className="text-sm text-stone-500 mt-0.5">Business performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",     value: formatCurrency(Number(analytics?.totalRevenue ?? 0)) },
          { label: "Avg Order Value",   value: formatCurrency(avgOrderValue) },
          { label: "Conversion Rate",   value: `${conversionRate}%` },
          { label: "Pending Orders",    value: String(analytics?.pendingOrders ?? 0) },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly trend line chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="revenue" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltipRevenue />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                <Line yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue (KES)" stroke="#c9a84c" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke="#78716c" strokeWidth={1.5} strokeDasharray="4 2" dot={false} activeDot={{ r: 3 }} />
                <Line yAxisId="revenue" type="monotone" dataKey="avgOrder" name="Avg Order" stroke="#a8a29e" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-stone-400">
              No order data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue by category */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4", fontSize: 12 }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {categoryRevenue.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-stone-400">
              No category data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top products table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {["#","Product","Units Sold","Revenue"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-stone-500 px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {(analytics?.topProducts ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-stone-400">
                    No sales data yet
                  </td>
                </tr>
              ) : (
                (analytics?.topProducts ?? []).map((tp: any, i: number) => (
                  <tr key={tp.productId} className="hover:bg-stone-50">
                    <td className="px-6 py-3.5">
                      <span className={`text-xs font-bold ${i === 0 ? "text-gold-600" : "text-stone-400"}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-stone-800">
                      {tp.product?.name ?? "Unknown"}
                    </td>
                    <td className="px-6 py-3.5 text-stone-600">{tp._sum?.quantity ?? 0} units</td>
                    <td className="px-6 py-3.5 font-semibold text-stone-800">
                      {formatCurrency((tp._sum?.quantity ?? 0) * Number(tp.product?.basePrice ?? 0))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
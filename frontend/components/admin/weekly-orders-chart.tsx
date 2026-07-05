"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface WeeklyDataPoint {
  day: string;
  orders: number;
  revenue: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-lg">
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-stone-800">
        {payload[0].value} orders
      </p>
      <p className="text-xs text-stone-500">
        {formatCurrency(payload[1]?.value ?? 0)}
      </p>
    </div>
  );
}

export function WeeklyOrdersChart({ data }: { data: WeeklyDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#78716c" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#78716c" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f5f4" }} />
        <Bar dataKey="orders" fill="#c9a84c" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="revenue" fill="#e7e5e4" radius={[4, 4, 0, 0]} maxBarSize={36} hide />
      </BarChart>
    </ResponsiveContainer>
  );
}
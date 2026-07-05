"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { truncate } from "@/lib/utils";

interface ProductDataPoint {
  name: string;
  units: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-lg">
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-stone-800">
        {payload[0].value} units sold
      </p>
    </div>
  );
}

export function TopProductsChart({ data }: { data: ProductDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#78716c" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 11, fill: "#78716c" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => truncate(v, 16)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f5f4" }} />
        <Bar dataKey="units" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? "#c9a84c" : i === 1 ? "#daa83f" : "#e7e5e4"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StatusDataPoint {
  name: string;
  value: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "#f59e0b",
  PAID:       "#3b82f6",
  PROCESSING: "#8b5cf6",
  SHIPPED:    "#c9a84c",
  DELIVERED:  "#10b981",
  CANCELLED:  "#ef4444",
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-stone-800">{payload[0].name}</p>
      <p className="text-sm text-stone-500">{payload[0].value} orders</p>
    </div>
  );
}

function CustomLegend({ payload }: any) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
      {payload.map((entry: any) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-stone-600">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export function OrderStatusChart({ data }: { data: StatusDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={STATUS_COLORS[entry.name] ?? "#a8a29e"}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
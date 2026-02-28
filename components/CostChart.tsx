"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartPoint {
  label: string;
  costEUR: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="text-gray-500 dark:text-gray-400">{label as string}</p>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold">
          €{(payload[0].value as number).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
}

export default function CostChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `€${v}`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="costEUR"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: "#6366f1", r: 3 }}
          activeDot={{ r: 5, fill: "#818cf8" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

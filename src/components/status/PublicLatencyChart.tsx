"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PublicLatencyChartProps = {
  data: { timestamp: string; latency: number | null }[];
};

function toChartTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}/${date.getDate()} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

export function PublicLatencyChart({ data }: PublicLatencyChartProps) {
  const chartData = data
    .filter((entry) => entry.latency !== null)
    .slice(-120)
    .map((entry) => ({
      time: toChartTime(entry.timestamp),
      latency: entry.latency,
    }));

  if (chartData.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border-dashed p-6 text-sm text-slate-400">
        Not enough public latency samples yet.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-100">Global Latency Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#94a3b8" hide />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Area
              dataKey="latency"
              type="monotone"
              stroke="#22d3ee"
              fill="#0891b2"
              fillOpacity={0.18}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

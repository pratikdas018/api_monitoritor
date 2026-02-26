"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { LatencyLogView } from "@/lib/queries";

type LatencyChartProps = {
  data: LatencyLogView[];
};

function chartTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
}

export function LatencyChart({ data }: LatencyChartProps) {
  const chartData = data
    .filter((item) => item.responseTimeMs !== null)
    .slice(-60)
    .map((item) => ({
      time: chartTimestamp(item.checkedAt),
      latency: item.responseTimeMs,
      success: item.success,
    }));

  if (chartData.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border-dashed p-6 text-sm text-slate-400">
        Not enough latency samples yet.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Response Time (last 60 checks)</p>
        <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-300">
          ms
        </span>
      </div>
      <div className="h-72 w-full md:h-80">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 5" />
          <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={44} />
          <Tooltip
            contentStyle={{
              background: "rgba(2, 6, 23, 0.95)",
              border: "1px solid #334155",
              borderRadius: "12px",
              color: "#f8fafc",
              boxShadow: "0 10px 25px -12px rgba(15, 23, 42, 0.9)",
            }}
          />
          <Line
            type="monotone"
            dataKey="latency"
            stroke="#22d3ee"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

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
      <div className="glass-card rounded-2xl border border-dashed p-6 text-sm text-text-muted">
        Not enough latency samples yet.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl border p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-secondary">Response Time (last 60 checks)</p>
        <span className="rounded-full border border-border-accent bg-accent/10 px-2.5 py-1 text-xs text-text-secondary">
          ms
        </span>
      </div>
      <div className="h-72 w-full md:h-80">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 5" />
            <XAxis dataKey="time" stroke="rgba(203,213,225,0.7)" tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(203,213,225,0.7)" tickLine={false} axisLine={false} width={44} />
            <Tooltip
              contentStyle={{
                background: "var(--black-800)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 0 20px rgba(59,130,246,0.25)",
              }}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={false}
              style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.4))" }}
              activeDot={{ r: 4, fill: "var(--text-primary)", stroke: "var(--accent)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

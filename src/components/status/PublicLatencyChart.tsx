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
      <div className="glass-card rounded-2xl border border-dashed p-6 text-sm text-text-muted">
        Not enough public latency samples yet.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl border p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Global Latency Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="rgba(203,213,225,0.7)" hide />
            <YAxis stroke="rgba(203,213,225,0.7)" />
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
            <Area
              dataKey="latency"
              type="monotone"
              stroke="var(--accent)"
              fill="rgba(59,130,246,0.12)"
              strokeWidth={2.4}
              style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.4))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

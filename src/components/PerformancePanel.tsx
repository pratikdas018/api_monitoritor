"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatCard } from "@/components/StatCard";
import type { PerformanceMetrics } from "@/lib/queries";

type PerformancePanelProps = {
  metrics: PerformanceMetrics;
};

type MetricTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
  }>;
  label?: string | number;
  valueLabel: string;
  accentColor: string;
  suffix?: string;
  decimals?: number;
};

function compactTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}/${date.getDate()} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function formatMetricValue(
  value: number | string | undefined,
  decimals: number,
  suffix: string,
) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value.toFixed(decimals)}${suffix}`;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return `${value}${suffix}`;
  }
  return `N/A${suffix}`;
}

function MetricTooltip({
  active,
  payload,
  label,
  valueLabel,
  accentColor,
  suffix = "",
  decimals = 0,
}: MetricTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const rawValue = payload[0]?.value;
  const value = formatMetricValue(rawValue, decimals, suffix);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "2px solid #0f172a",
        borderRadius: "10px",
        padding: "10px 12px",
        boxShadow: "0 14px 28px -12px rgba(2, 6, 23, 0.75)",
        minWidth: "150px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#334155",
          fontSize: "14px",
          fontWeight: 700,
          lineHeight: 1.25,
        }}
      >
        {String(label ?? "")}
      </p>
      <p
        style={{
          margin: "8px 0 0",
          color: accentColor,
          fontSize: "30px",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <p
        style={{
          margin: "6px 0 0",
          color: "#0f172a",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {valueLabel}
      </p>
    </div>
  );
}

export function PerformancePanel({ metrics }: PerformancePanelProps) {
  const statusCodeData = Object.entries(metrics.statusCodeDistribution).map(([code, count]) => ({
    code,
    count,
  }));

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Average Latency" value={`${metrics.averageLatencyMs} ms`} tone="info" />
        <StatCard label="P95 Latency" value={`${metrics.p95LatencyMs} ms`} tone="warn" />
        <StatCard label="Error Rate" value={`${metrics.errorRate}%`} tone={metrics.errorRate > 1 ? "bad" : "good"} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="glass-panel rounded-2xl p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-100">Response Time Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                data={metrics.responseTrend.map((item) => ({
                  ...item,
                  timestamp: compactTimeLabel(item.timestamp),
                }))}
              >
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" hide />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  content={
                    <MetricTooltip
                      valueLabel="Latency"
                      accentColor="#0369a1"
                      suffix=" ms"
                    />
                  }
                  wrapperStyle={{ outline: "none" }}
                  cursor={{ stroke: "#f8fafc", strokeOpacity: 0.35, strokeWidth: 1.2 }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#22d3ee"
                  dot={false}
                  activeDot={{ r: 4, fill: "#f8fafc", stroke: "#06b6d4", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-100">Uptime Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.uptimeTrend}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip
                  content={
                    <MetricTooltip
                      valueLabel="Uptime"
                      accentColor="#059669"
                      suffix="%"
                      decimals={2}
                    />
                  }
                  wrapperStyle={{ outline: "none" }}
                  cursor={{ stroke: "#f8fafc", strokeOpacity: 0.35, strokeWidth: 1.2 }}
                />
                <Line
                  type="monotone"
                  dataKey="uptimePercentage"
                  stroke="#34d399"
                  dot={false}
                  activeDot={{ r: 4, fill: "#f8fafc", stroke: "#34d399", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-100">Status Code Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusCodeData}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="code" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                content={
                  <MetricTooltip
                    valueLabel="Responses"
                    accentColor="#1d4ed8"
                  />
                }
                wrapperStyle={{ outline: "none" }}
              />
              <Legend />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

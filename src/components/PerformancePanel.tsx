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
        background: "var(--black-800)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        padding: "10px 12px",
        backdropFilter: "blur(16px)",
        boxShadow: "0 0 20px rgba(59,130,246,0.25)",
        minWidth: "150px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "var(--text-secondary)",
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
          color: "var(--text-muted)",
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
        <div className="glass-card rounded-2xl border p-4">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Response Time Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.responseTrend.map((item) => ({
                  ...item,
                  timestamp: compactTimeLabel(item.timestamp),
                }))}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" stroke="rgba(203,213,225,0.7)" hide />
                <YAxis stroke="rgba(203,213,225,0.7)" />
                <Tooltip
                  content={
                    <MetricTooltip
                      valueLabel="Latency"
                      accentColor="var(--accent)"
                      suffix=" ms"
                    />
                  }
                  wrapperStyle={{ outline: "none" }}
                  cursor={{ stroke: "rgba(59,130,246,0.45)", strokeWidth: 1.2 }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="var(--accent)"
                  dot={false}
                  style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.45))" }}
                  activeDot={{ r: 4, fill: "var(--text-primary)", stroke: "var(--accent)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl border p-4">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Uptime Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.uptimeTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" stroke="rgba(203,213,225,0.7)" />
                <YAxis domain={[0, 100]} stroke="rgba(203,213,225,0.7)" />
                <Tooltip
                  content={
                    <MetricTooltip
                      valueLabel="Uptime"
                      accentColor="var(--green)"
                      suffix="%"
                      decimals={2}
                    />
                  }
                  wrapperStyle={{ outline: "none" }}
                  cursor={{ stroke: "rgba(59,130,246,0.45)", strokeWidth: 1.2 }}
                />
                <Line
                  type="monotone"
                  dataKey="uptimePercentage"
                  stroke="var(--green)"
                  dot={false}
                  style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.45))" }}
                  activeDot={{ r: 4, fill: "var(--text-primary)", stroke: "var(--green)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border p-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">Status Code Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusCodeData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="code" stroke="rgba(203,213,225,0.7)" />
              <YAxis stroke="rgba(203,213,225,0.7)" />
              <Tooltip
                content={
                  <MetricTooltip
                    valueLabel="Responses"
                    accentColor="var(--accent)"
                  />
                }
                wrapperStyle={{ outline: "none" }}
              />
              <Legend wrapperStyle={{ color: "var(--text-secondary)" }} />
              <Bar dataKey="count" fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

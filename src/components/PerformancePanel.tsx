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

function compactTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}/${date.getDate()} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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
                <Tooltip />
                <Line type="monotone" dataKey="latency" stroke="#22d3ee" dot={false} />
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
                <Tooltip />
                <Line type="monotone" dataKey="uptimePercentage" stroke="#34d399" dot={false} />
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
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

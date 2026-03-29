"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendRow = {
  date: string;
  uptimePercentage: number;
  avgLatencyMs: number;
};

type AdminTrendChartsProps = {
  data: TrendRow[];
};

export function AdminTrendCharts({ data }: AdminTrendChartsProps) {
  if (!data.length) {
    return (
      <div className="glass-card rounded-2xl border border-dashed p-6 text-sm text-text-muted">
        Not enough monitoring trend data yet.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <article className="glass-card rounded-2xl border p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary md:text-base">Uptime Trend (7 days)</h3>
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="rgba(203,213,225,0.7)" tick={{ fontSize: 11 }} minTickGap={18} />
              <YAxis domain={[0, 100]} stroke="rgba(203,213,225,0.7)" tick={{ fontSize: 11 }} width={34} />
              <Tooltip
                contentStyle={{
                  background: "var(--black-800)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "12px",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 0 20px rgba(59,130,246,0.22)",
                }}
              />
              <Legend wrapperStyle={{ color: "var(--text-secondary)" }} />
              <Line
                dataKey="uptimePercentage"
                type="monotone"
                stroke="var(--green)"
                strokeWidth={2}
                dot={false}
                style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.35))" }}
                name="Uptime %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass-card rounded-2xl border p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary md:text-base">Latency Trend (7 days)</h3>
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="rgba(203,213,225,0.7)" tick={{ fontSize: 11 }} minTickGap={18} />
              <YAxis stroke="rgba(203,213,225,0.7)" tick={{ fontSize: 11 }} width={34} />
              <Tooltip
                contentStyle={{
                  background: "var(--black-800)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "12px",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 0 20px rgba(59,130,246,0.22)",
                }}
              />
              <Legend wrapperStyle={{ color: "var(--text-secondary)" }} />
              <Line
                dataKey="avgLatencyMs"
                type="monotone"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.35))" }}
                name="Avg Latency (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

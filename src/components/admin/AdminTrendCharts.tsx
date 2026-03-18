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
      <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/50 p-6 text-sm text-slate-400">
        Not enough monitoring trend data yet.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-100 md:text-base">Uptime Trend (7 days)</h3>
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} minTickGap={18} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} width={34} />
              <Tooltip />
              <Legend />
              <Line
                dataKey="uptimePercentage"
                type="monotone"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
                name="Uptime %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-100 md:text-base">Latency Trend (7 days)</h3>
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} minTickGap={18} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} width={34} />
              <Tooltip />
              <Legend />
              <Line
                dataKey="avgLatencyMs"
                type="monotone"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                name="Avg Latency (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

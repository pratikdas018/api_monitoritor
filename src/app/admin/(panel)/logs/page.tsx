import { AdminLogsTable } from "@/components/admin/AdminLogsTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { getAdminLogsData } from "@/lib/adminQueries";

export const dynamic = "force-dynamic";

type AdminLogsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminLogsPage({ searchParams }: AdminLogsPageProps) {
  const page = Number(getSingle(searchParams?.page) ?? "1");
  const limit = Number(getSingle(searchParams?.limit) ?? "20");
  const userId = getSingle(searchParams?.userId) ?? "";
  const monitorId = getSingle(searchParams?.monitorId) ?? "";
  const eventType = getSingle(searchParams?.eventType) ?? "";
  const dateFrom = getSingle(searchParams?.dateFrom) ?? "";
  const dateTo = getSingle(searchParams?.dateTo) ?? "";

  const data = await getAdminLogsData({
    page,
    limit,
    userId: userId || undefined,
    monitorId: monitorId || undefined,
    eventType: eventType || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const createPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    if (userId) params.set("userId", userId);
    if (monitorId) params.set("monitorId", monitorId);
    if (eventType) params.set("eventType", eventType);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return `/admin/logs?${params.toString()}`;
  };

  const csvParams = new URLSearchParams();
  csvParams.set("format", "csv");
  if (userId) csvParams.set("userId", userId);
  if (monitorId) csvParams.set("monitorId", monitorId);
  if (eventType) csvParams.set("eventType", eventType);
  if (dateFrom) csvParams.set("dateFrom", dateFrom);
  if (dateTo) csvParams.set("dateTo", dateTo);

  return (
    <div className="space-y-4 lg:space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">Monitoring Logs</h2>
          <p className="mt-1 text-sm text-slate-400">
            Status changes, incidents, and downtime events across all APIs.
          </p>
        </div>
        <a
          href={`/api/admin/logs?${csvParams.toString()}`}
          className="min-h-10 rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-sky-400/60 hover:text-sky-200"
        >
          Export CSV
        </a>
      </header>

      <form className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input
          name="userId"
          defaultValue={userId}
          placeholder="User ID"
          className="min-h-11 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
        />
        <input
          name="monitorId"
          defaultValue={monitorId}
          placeholder="Monitor ID"
          className="min-h-11 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
        />
        <input
          name="eventType"
          defaultValue={eventType}
          placeholder="Event type"
          className="min-h-11 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
        />
        <input
          name="dateFrom"
          type="date"
          defaultValue={dateFrom}
          className="min-h-11 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
        />
        <input
          name="dateTo"
          type="date"
          defaultValue={dateTo}
          className="min-h-11 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
        />
        <input type="hidden" name="limit" value={limit} />
        <button
          type="submit"
          className="min-h-11 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-sky-400 sm:col-span-2 lg:col-span-1"
        >
          Apply Filters
        </button>
      </form>

      <AdminLogsTable logs={data.items} />
      <AdminPagination page={data.page} totalPages={data.totalPages} createPageHref={createPageHref} />
    </div>
  );
}

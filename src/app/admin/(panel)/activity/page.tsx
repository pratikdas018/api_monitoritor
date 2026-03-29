import { AdminActivityTable } from "@/components/admin/AdminActivityTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { getAdminActivityData } from "@/lib/adminQueries";

export const dynamic = "force-dynamic";

type AdminActivityPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminActivityPage({ searchParams }: AdminActivityPageProps) {
  const page = Number(getSingle(searchParams?.page) ?? "1");
  const limit = Number(getSingle(searchParams?.limit) ?? "20");
  const search = getSingle(searchParams?.search) ?? "";
  const action = getSingle(searchParams?.action) ?? "";
  const role = getSingle(searchParams?.role) ?? "";
  const dateFrom = getSingle(searchParams?.dateFrom) ?? "";
  const dateTo = getSingle(searchParams?.dateTo) ?? "";

  const data = await getAdminActivityData({
    page,
    limit,
    search: search || undefined,
    action: action || undefined,
    role: role || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const createPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (action) params.set("action", action);
    if (role) params.set("role", role);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return `/admin/activity?${params.toString()}`;
  };

  const csvParams = new URLSearchParams();
  csvParams.set("format", "csv");
  if (search) csvParams.set("search", search);
  if (action) csvParams.set("action", action);
  if (role) csvParams.set("role", role);
  if (dateFrom) csvParams.set("dateFrom", dateFrom);
  if (dateTo) csvParams.set("dateTo", dateTo);

  return (
    <div className="space-y-4 lg:space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">Activity Logs</h2>
          <p className="mt-1 text-sm text-text-muted">
            Track user and admin actions across authentication and monitor operations.
          </p>
        </div>
        <a
          href={`/api/admin/activity?${csvParams.toString()}`}
          className="min-h-10 rounded-lg border border-border-accent bg-surface-card/70 px-3 py-2 text-xs font-semibold text-text-secondary hover:border-accent/70 hover:text-accent-bright"
        >
          Export CSV
        </a>
      </header>

      <form className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface-card/60 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by user/action"
          className="min-h-11 rounded-xl border border-border-accent bg-surface-card/80 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/80 sm:col-span-2 lg:col-span-2"
        />
        <input
          name="action"
          defaultValue={action}
          placeholder="Action"
          className="min-h-11 rounded-xl border border-border-accent bg-surface-card/80 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/80"
        />
        <select
          name="role"
          defaultValue={role}
          className="min-h-11 rounded-xl border border-border-accent bg-surface-card/80 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/80"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <input
          name="dateFrom"
          type="date"
          defaultValue={dateFrom}
          className="min-h-11 rounded-xl border border-border-accent bg-surface-card/80 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/80"
        />
        <input
          name="dateTo"
          type="date"
          defaultValue={dateTo}
          className="min-h-11 rounded-xl border border-border-accent bg-surface-card/80 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/80"
        />
        <input type="hidden" name="limit" value={limit} />
        <button
          type="submit"
          className="min-h-11 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent-bright transition hover:border-accent sm:col-span-2 lg:col-span-1"
        >
          Apply Filters
        </button>
      </form>

      <AdminActivityTable rows={data.items} />
      <AdminPagination page={data.page} totalPages={data.totalPages} createPageHref={createPageHref} />
    </div>
  );
}


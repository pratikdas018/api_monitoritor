import { AdminApisTable } from "@/components/admin/AdminApisTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { getAdminApisData } from "@/lib/adminQueries";

export const dynamic = "force-dynamic";

type AdminApisPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminApisPage({ searchParams }: AdminApisPageProps) {
  const page = Number(getSingle(searchParams?.page) ?? "1");
  const limit = Number(getSingle(searchParams?.limit) ?? "20");
  const search = getSingle(searchParams?.search) ?? "";
  const status = getSingle(searchParams?.status) ?? "";
  const userId = getSingle(searchParams?.userId) ?? "";

  const data = await getAdminApisData({
    page,
    limit,
    search,
    status: status || undefined,
    userId: userId || undefined,
  });

  const createPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (userId) params.set("userId", userId);
    return `/admin/apis?${params.toString()}`;
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <header>
        <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">API Monitoring Overview</h2>
        <p className="mt-1 text-sm text-slate-400">
          Review all monitors across users and take platform-level actions.
        </p>
      </header>

      <form className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name/url/user/email"
          className="min-h-11 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 sm:col-span-2 lg:col-span-2"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-11 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
        >
          <option value="">All Status</option>
          <option value="up">Up</option>
          <option value="down">Down</option>
          <option value="paused">Paused</option>
          <option value="unknown">Unknown</option>
        </select>
        <input
          name="userId"
          defaultValue={userId}
          placeholder="Filter by userId"
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

      <AdminApisTable apis={data.items} />
      <AdminPagination page={data.page} totalPages={data.totalPages} createPageHref={createPageHref} />
    </div>
  );
}

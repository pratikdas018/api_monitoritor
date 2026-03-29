import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { getAdminUsersData } from "@/lib/adminQueries";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function decodeParam(value: string) {
  const normalized = value.replace(/\+/g, " ");
  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const page = Number(getSingle(searchParams?.page) ?? "1");
  const limit = Number(getSingle(searchParams?.limit) ?? "20");
  const search = decodeParam(getSingle(searchParams?.search) ?? "");
  const status = decodeParam(getSingle(searchParams?.status) ?? "");
  const role = decodeParam(getSingle(searchParams?.role) ?? "");

  const data = await getAdminUsersData({
    page,
    limit,
    search,
    status: status || undefined,
    role: role || undefined,
  });

  const createPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (role) params.set("role", role);
    return `/admin/users?${params.toString()}`;
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <header>
        <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">User Management</h2>
        <p className="mt-1 text-sm text-text-muted">View, suspend, or delete platform users.</p>
      </header>

      <form className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface-card/60 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name/email/authId"
          className="min-h-11 rounded-xl border border-border-accent bg-surface-card/80 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/80 sm:col-span-2 lg:col-span-2"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-11 rounded-xl border border-border-accent bg-surface-card/80 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/80"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
        <select
          name="role"
          defaultValue={role}
          className="min-h-11 rounded-xl border border-border-accent bg-surface-card/80 px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent/80"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <input type="hidden" name="limit" value={limit} />
        <button
          type="submit"
          className="min-h-11 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent-bright transition hover:border-accent sm:col-span-2 lg:col-span-1"
        >
          Apply Filters
        </button>
      </form>

      <AdminUsersTable users={data.items} />
      <AdminPagination page={data.page} totalPages={data.totalPages} createPageHref={createPageHref} />
    </div>
  );
}


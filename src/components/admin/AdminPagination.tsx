import Link from "next/link";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  createPageHref: (nextPage: number) => string;
};

export function AdminPagination({ page, totalPages, createPageHref }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-end">
      <Link
        href={createPageHref(Math.max(1, page - 1))}
        className={`min-h-9 rounded-lg border px-3 py-1.5 text-xs ${
          page <= 1
            ? "pointer-events-none border-slate-800/80 text-slate-600"
            : "border-slate-700/80 text-slate-200 hover:border-sky-400/60 hover:text-sky-200"
        }`}
      >
        Prev
      </Link>
      <p className="w-full text-center text-xs text-slate-400 sm:w-auto">
        Page {page} / {totalPages}
      </p>
      <Link
        href={createPageHref(Math.min(totalPages, page + 1))}
        className={`min-h-9 rounded-lg border px-3 py-1.5 text-xs ${
          page >= totalPages
            ? "pointer-events-none border-slate-800/80 text-slate-600"
            : "border-slate-700/80 text-slate-200 hover:border-sky-400/60 hover:text-sky-200"
        }`}
      >
        Next
      </Link>
    </div>
  );
}

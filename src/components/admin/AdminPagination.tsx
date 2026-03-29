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
            ? "pointer-events-none border-border text-text-muted"
            : "border-border-accent text-text-secondary hover:border-accent/70 hover:text-accent-bright"
        }`}
      >
        Prev
      </Link>
      <p className="w-full text-center text-xs text-text-muted sm:w-auto">
        Page {page} / {totalPages}
      </p>
      <Link
        href={createPageHref(Math.min(totalPages, page + 1))}
        className={`min-h-9 rounded-lg border px-3 py-1.5 text-xs ${
          page >= totalPages
            ? "pointer-events-none border-border text-text-muted"
            : "border-border-accent text-text-secondary hover:border-accent/70 hover:text-accent-bright"
        }`}
      >
        Next
      </Link>
    </div>
  );
}


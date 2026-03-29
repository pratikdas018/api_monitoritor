export default function IncidentsLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="skeleton-shimmer h-4 w-44 rounded-xl" />
          <div className="skeleton-shimmer mt-3 h-10 w-64 rounded-xl" />
        </div>
        <div className="skeleton-shimmer h-10 w-40 rounded-xl" />
      </header>

      <section className="glass-card rounded-2xl border p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="skeleton-shimmer h-4 w-40 rounded-xl" />
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-accent/40 border-t-transparent"
            aria-label="Loading incidents"
          />
        </div>

        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="glass-card rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="skeleton-shimmer h-4 w-44 rounded-xl" />
                <div className="skeleton-shimmer h-7 w-24 rounded-full" />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="skeleton-shimmer h-4 w-full rounded-xl" />
                <div className="skeleton-shimmer h-4 w-5/6 rounded-xl" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="skeleton-shimmer h-7 w-28 rounded-full" />
                <div className="skeleton-shimmer h-7 w-32 rounded-full" />
                <div className="skeleton-shimmer h-7 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

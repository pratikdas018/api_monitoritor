export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center px-4 py-10">
      <div className="glass-card relative w-full max-w-sm overflow-hidden rounded-2xl border px-6 py-5">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-1/2 top-0 h-full w-[200%] loading-shimmer" />
        </div>

        <div className="relative flex items-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-accent/40 border-t-transparent"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">Loading</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary" aria-live="polite">
              Fetching latest data
              <span className="inline-flex w-6 items-end justify-start" aria-hidden="true">
                <span className="loading-dot">.</span>
                <span className="loading-dot delay-150">.</span>
                <span className="loading-dot delay-300">.</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

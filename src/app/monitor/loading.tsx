export default function MonitorLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-5 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="h-28 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
    </main>
  );
}

export default function MonitorLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-5 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="glass-card h-28 animate-pulse rounded-2xl border" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-card h-24 animate-pulse rounded-xl border" />
        ))}
      </div>
      <div className="glass-card h-96 animate-pulse rounded-xl border" />
    </main>
  );
}

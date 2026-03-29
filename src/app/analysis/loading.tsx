export default function AnalysisLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-5 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="glass-card h-28 animate-pulse rounded-2xl border" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card h-56 animate-pulse rounded-xl border" />
        ))}
      </div>
    </main>
  );
}

export default function ReposLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1300px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-800" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="h-4 w-2/3 rounded bg-slate-700" />
              <div className="mt-2 h-3 w-full rounded bg-slate-800" />
              <div className="mt-2 h-3 w-4/5 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

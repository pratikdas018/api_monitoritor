export default function RepoDetailLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1300px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
          <div className="h-72 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
        </div>
        <div className="h-72 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
      </div>
    </main>
  );
}

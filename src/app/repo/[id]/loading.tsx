export default function RepoDetailLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1300px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="space-y-4">
        <div className="glass-card h-24 animate-pulse rounded-2xl border" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card h-72 animate-pulse rounded-xl border" />
          <div className="glass-card h-72 animate-pulse rounded-xl border" />
        </div>
        <div className="glass-card h-72 animate-pulse rounded-xl border" />
      </div>
    </main>
  );
}

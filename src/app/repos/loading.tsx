export default function ReposLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1300px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="space-y-4">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="glass-card rounded-xl border p-4">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton mt-2 h-3 w-full rounded" />
              <div className="skeleton mt-2 h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

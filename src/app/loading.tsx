export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:py-8">
      <section className="glass-panel rounded-2xl p-6">
        <div className="skeleton h-4 w-44" />
        <div className="skeleton mt-4 h-10 w-56" />
        <div className="skeleton mt-3 h-4 w-72" />
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="glass-panel rounded-2xl p-5">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-4 h-8 w-16" />
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <div className="skeleton h-4 w-40" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="skeleton h-11" />
          <div className="skeleton h-11 sm:col-span-2" />
          <div className="skeleton h-11" />
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton mt-4 h-64 w-full" />
      </section>
    </main>
  );
}

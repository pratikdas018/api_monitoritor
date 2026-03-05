import Image from "next/image";

export function StatusPreviewSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
          Public Status Page Preview
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Share transparent service health and uptime reporting with customers.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <Image
          src="/status-preview.svg"
          alt="Public status page preview"
          width={1200}
          height={720}
          className="h-auto w-full rounded-xl border border-slate-700/60"
        />
      </div>
    </section>
  );
}

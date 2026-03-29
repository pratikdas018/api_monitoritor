import Image from "next/image";

const statusHighlights = [
  { label: "Service Visibility", value: "Public" },
  { label: "Incident Timeline", value: "Live" },
  { label: "Uptime Reporting", value: "Transparent" },
];

export function StatusPreviewSection() {
  return (
    <section id="status-preview" className="space-y-5">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Public Status Page</p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl">
          Share Real-time Service Health With Your Users
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
          Users can check real-time service status using the public status page for clear,
          transparent uptime communication.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card rounded-2xl border p-5 lg:col-span-1">
          <div className="space-y-3">
            {statusHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border-accent bg-accent/10 px-3 py-2.5"
              >
                <p className="text-xs uppercase tracking-[0.1em] text-text-muted">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl border p-4 lg:col-span-2">
          <Image
            src="/status-preview.svg"
            alt="Public status page preview"
            width={1200}
            height={720}
            className="h-auto w-full rounded-xl border border-border-accent"
          />
        </div>
      </div>
    </section>
  );
}

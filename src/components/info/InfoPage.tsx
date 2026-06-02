import type { LucideIcon } from "lucide-react";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

type InfoSectionProps = {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
};

export function InfoPage({ eyebrow, title, description, children }: InfoPageProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1180px] px-4 py-8 sm:px-6 md:px-8 lg:px-10 xl:py-10">
      <header className="rounded-2xl border border-border bg-surface-card p-5 shadow-accent-lg md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-bright">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary md:text-base">
          {description}
        </p>
      </header>
      <div className="mt-6 grid gap-4 md:grid-cols-2">{children}</div>
    </main>
  );
}

export function InfoSection({ icon: Icon, title, children }: InfoSectionProps) {
  return (
    <section className="glass-card card-interactive rounded-xl border p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-border-accent bg-accent/10 text-accent-bright">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <div className="mt-2 text-sm leading-7 text-text-secondary">{children}</div>
        </div>
      </div>
    </section>
  );
}

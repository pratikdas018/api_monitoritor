import Link from "next/link";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const productLinks: FooterLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Status Page", href: "/status" },
  { label: "Incidents", href: "/incidents" },
];

const resourceLinks: FooterLink[] = [
  { label: "Documentation", href: "https://github.com/pratikdas018/api_monitoritor#readme", external: true },
  { label: "GitHub Repository", href: "https://github.com/pratikdas018/api_monitoritor", external: true },
];

const platformLinks: FooterLink[] = [
  { label: "About", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Monitoring System", href: "/#architecture" },
];

const socialLinks: FooterLink[] = [
  { label: "GitHub", href: "https://github.com/pratikdas018/api_monitoritor", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com", external: true },
];

function renderLink(link: FooterLink) {
  const className =
    "text-sm text-slate-400 transition hover:text-sky-200";

  if (link.external) {
    return (
      <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <Link key={link.label} href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800/70 bg-[linear-gradient(180deg,rgba(2,6,23,0.75),rgba(2,6,23,0.97))]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-300">Product</h3>
            <div className="mt-3 flex flex-col gap-2">{productLinks.map(renderLink)}</div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-300">Resources</h3>
            <div className="mt-3 flex flex-col gap-2">{resourceLinks.map(renderLink)}</div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-300">Platform</h3>
            <div className="mt-3 flex flex-col gap-2">{platformLinks.map(renderLink)}</div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-300">Developer</h3>
            <p className="mt-3 text-sm text-slate-300">Developed by Pratik</p>
            <div className="mt-3 flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-sky-400/60 hover:text-sky-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 border-t border-slate-800/80 pt-5 text-xs text-slate-500">
          © 2026 API Monitor Platform
        </div>
      </div>
    </footer>
  );
}

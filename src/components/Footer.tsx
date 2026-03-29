"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const className = "text-sm font-semibold text-text-secondary transition hover:text-text-primary";

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
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-black/95 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Product</h3>
            <div className="mt-3 flex flex-col gap-2">{productLinks.map(renderLink)}</div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Resources</h3>
            <div className="mt-3 flex flex-col gap-2">{resourceLinks.map(renderLink)}</div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Platform</h3>
            <div className="mt-3 flex flex-col gap-2">{platformLinks.map(renderLink)}</div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Developer</h3>
            <p className="mt-3 text-sm font-semibold text-text-secondary">
              Developed by{" "}
              <a
                href="https://pratik-web.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-accent-bright transition hover:text-accent-bright"
              >
                Pratik
              </a>
            </p>
            <div className="mt-3 flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-btn border border-border-accent bg-accent/10 px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-accent/15 hover:text-text-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 border-t border-border pt-5 text-xs font-medium text-text-muted">
          (c) 2026 API Monitor Platform
        </div>
      </div>
    </footer>
  );
}

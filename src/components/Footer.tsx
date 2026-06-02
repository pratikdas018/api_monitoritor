"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Briefcase, Code2, Mail, MapPin, MonitorCheck, X } from "lucide-react";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const productLinks: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Status Page", href: "/status" },
  { label: "Incidents", href: "/incidents" },
  { label: "Monitoring System", href: "/monitor" },
];

const supportLinks: FooterLink[] = [
  { label: "Help Center", href: "/help-center" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

const socialLinks: FooterLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com", external: true },
  { label: "GitHub", href: "https://github.com/pratikdas018/api_monitoritor", external: true },
  { label: "X (Twitter)", href: "https://x.com", external: true },
];

function renderLink(link: FooterLink) {
  const className =
    "w-fit text-sm font-medium text-text-secondary transition-all duration-200 hover:translate-x-1 hover:text-text-primary";

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
    <footer className="border-t border-border bg-[#101827]/95 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.25fr]">
          <section className="max-w-sm">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-card bg-gradient-to-br from-cyan-400 to-accent text-white shadow-accent transition duration-200 group-hover:-translate-y-0.5">
                <Activity className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xl font-bold text-text-primary">API Monitor</span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-text-secondary">
              API Monitor helps developers monitor API uptime, performance, incidents, and system
              health in real time.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase text-text-primary">Quick Links</h3>
            <div className="mt-5 flex flex-col gap-3">{productLinks.map(renderLink)}</div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase text-text-primary">Support</h3>
            <div className="mt-5 flex flex-col gap-3">{supportLinks.map(renderLink)}</div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase text-text-primary">Contact</h3>
            <div className="mt-5 space-y-3 text-sm text-text-secondary">
              <p className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-text-primary">Email:</span>{" "}
                  <a href="mailto:support@apimonitor.com" className="transition hover:text-text-primary">
                    support@apimonitor.com
                  </a>
                </span>
              </p>
              <p className="flex gap-2">
                <MonitorCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-text-primary">Portfolio:</span>{" "}
                  <a
                    href="https://pratik-web.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-text-primary"
                  >
                    pratik-web.vercel.app
                  </a>
                </span>
              </p>
              <p className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-text-primary">Location:</span> Kolkata, India
                </span>
              </p>
              <p className="text-sm text-text-secondary">
                Developed by{" "}
                <a
                  href="https://pratik-web.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-accent-bright transition hover:text-text-primary"
                >
                  Pratik
                </a>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            &copy; 2026 API Monitor. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:justify-end">
            {socialLinks.map((link) => {
              const Icon =
                link.label === "LinkedIn" ? Briefcase : link.label === "GitHub" ? Code2 : X;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-card border border-white/10 bg-white/[0.03] text-text-secondary transition-all duration-200 hover:-translate-y-1 hover:border-accent/60 hover:bg-accent/10 hover:text-text-primary hover:shadow-accent"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { UserMenu } from "@/components/UserMenu";

type NavbarProps = {
  userId: string | null;
  githubUrl?: string;
};

type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

function normalizePath(pathname: string | null) {
  if (!pathname) return "/";
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

export function Navbar({ userId, githubUrl }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: "Home", href: "/" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Status Page", href: "/status" },
      { label: "Incidents", href: "/incidents" },
      { label: "GitHub", href: githubUrl ?? "https://github.com/pratikdas018/api_monitoritor", external: true },
    ],
    [githubUrl],
  );

  const currentPath = normalizePath(pathname);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10"
        aria-label="Primary navigation"
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/15 text-xs font-semibold tracking-[0.08em] text-sky-200">
              AP
            </span>
            <span className="hidden text-sm font-semibold text-slate-100 sm:inline">
              API Monitor Platform
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = !item.external && normalizePath(item.href) === currentPath;
            const className = `rounded-xl px-3 py-2 text-sm transition ${
              isActive
                ? "border border-sky-400/50 bg-sky-500/15 text-sky-200"
                : "text-slate-300 hover:bg-slate-900/60 hover:text-sky-200"
            }`;

            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link key={item.label} href={item.href} className={className}>
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {userId ? (
            <UserMenu userId={userId} />
          ) : (
            <Link href="/login" className="btn-soft">
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/70 text-slate-200 transition hover:border-sky-400/60 hover:text-sky-200 md:hidden"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          <span className="text-lg leading-none">{mobileOpen ? "x" : "≡"}</span>
        </button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-slate-800/70 bg-slate-950/90 px-4 py-3 md:hidden">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2">
            {navItems.map((item) => {
              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800/70 hover:text-sky-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800/70 hover:text-sky-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-2 border-t border-slate-800/80 pt-2">
              {userId ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-2">
                  <p className="max-w-[70%] truncate text-xs text-slate-300">{userId}</p>
                  <UserMenu userId={userId} />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

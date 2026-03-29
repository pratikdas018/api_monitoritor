"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { UserMenu } from "@/components/UserMenu";

type NavbarProps = {
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

export function Navbar({ githubUrl }: NavbarProps) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();

  const sessionLabel =
    session?.user?.name?.trim() ||
    session?.user?.email?.trim() ||
    session?.user?.id?.trim() ||
    null;

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: "Home", href: "/" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Repos", href: "/repos" },
      { label: "Monitor", href: "/monitor" },
      { label: "Analysis", href: "/analysis" },
      { label: "Status Page", href: "/status" },
      { label: "Incidents", href: "/incidents" },
      {
        label: "GitHub",
        href: githubUrl ?? "https://github.com/pratikdas018/api_monitoritor",
        external: true,
      },
    ],
    [githubUrl],
  );

  const currentPath = normalizePath(pathname);

  if (isAdminPath) {
    return null;
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[60] border-b border-border bg-black/90 backdrop-blur-[20px]">
        <nav
          className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10"
          aria-label="Primary navigation"
        >
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-bright bg-black text-sm font-bold tracking-[0.08em] text-text-primary">
                AP
              </span>
              <span className="hidden text-base font-semibold text-text-primary sm:inline">
                API Monitor Platform
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = !item.external && normalizePath(item.href) === currentPath;
              const className = `rounded-xl px-3 py-2 text-[15px] font-semibold transition-all ${
                isActive
                  ? "relative font-bold text-accent-bright before:absolute before:bottom-0 before:left-1/2 before:h-1 before:w-1 before:-translate-x-1/2 before:rounded-full before:bg-accent"
                  : "text-text-muted hover:text-text-primary"
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
            {status === "loading" ? (
              <span className="rounded-btn border border-border bg-surface-card/70 px-3 py-2 text-xs text-text-muted">
                Loading...
              </span>
            ) : sessionLabel ? (
              <UserMenu />
            ) : (
              <Link href="/login" className="btn-primary px-4 py-2 text-sm font-semibold">
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-accent bg-surface-card/70 text-text-secondary transition hover:text-text-primary md:hidden"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            <span className="text-lg leading-none">{mobileOpen ? "x" : "="}</span>
          </button>
        </nav>

        {mobileOpen ? (
          <div className="border-t border-border-accent bg-black/95 px-4 py-3 md:hidden">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2">
              {navItems.map((item) => {
                const isActive = !item.external && normalizePath(item.href) === currentPath;

                if (item.external) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl px-3 py-2 text-[15px] font-semibold text-text-secondary transition hover:bg-accent/10 hover:text-text-primary"
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
                    className={`rounded-xl px-3 py-2 text-[15px] font-semibold transition ${
                      isActive
                        ? "glass-card accent-text border-l-2 border-l-accent"
                        : "text-text-secondary hover:bg-accent/10 hover:text-text-primary"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-2 border-t border-border pt-2">
                {sessionLabel ? (
                  <div className="glass-card flex items-center justify-between rounded-xl px-3 py-2">
                    <p className="max-w-[70%] truncate text-sm text-text-secondary">{sessionLabel}</p>
                    <UserMenu />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="btn-primary inline-flex w-full items-center justify-center px-4 py-2 text-sm font-semibold"
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
      <div aria-hidden="true" className="h-16 w-full shrink-0" />
    </>
  );
}

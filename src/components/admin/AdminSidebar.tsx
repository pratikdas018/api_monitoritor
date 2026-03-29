"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/apis", label: "APIs" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/activity", label: "Activity" },
];

type AdminSidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({ collapsed = false, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b border-border px-4 py-5 md:px-5">
        <p className={`text-[11px] uppercase tracking-[0.22em] text-text-muted ${collapsed ? "md:text-center" : ""}`}>
          Admin Panel
        </p>
        <p className={`mt-1 text-base font-semibold text-text-primary ${collapsed ? "md:text-center md:text-sm xl:text-base" : ""}`}>
          {collapsed ? "APM" : "API Monitor"}
        </p>
      </div>

      <nav className="flex flex-col gap-2 px-3 py-4 md:px-4" aria-label="Admin navigation">
        {links.map((link) => {
          const isRoot = link.href === "/admin";
          const isActive = isRoot ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? "border border-accent/60 bg-accent/10 text-accent-bright"
                  : "border border-transparent text-text-secondary hover:border-border-accent hover:bg-black-900/80 hover:text-accent-bright"
              } ${collapsed ? "md:px-2.5 md:text-center xl:px-3 xl:text-left" : ""}`}
              title={collapsed ? link.label : undefined}
            >
              <span className={`${collapsed ? "md:hidden xl:inline" : ""}`}>{link.label}</span>
              <span className={`hidden font-semibold ${collapsed ? "md:inline xl:hidden" : ""}`}>
                {link.label.charAt(0)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-4 md:px-5 md:pb-5">
        <p
          className={`rounded-xl border border-border bg-black-900/75 px-3 py-2 text-[11px] text-text-muted ${
            collapsed ? "md:hidden xl:block" : ""
          }`}
        >
          Platform-wide controls and audit visibility.
        </p>
      </div>
    </div>
  );
}


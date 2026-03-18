"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";

type AdminTopbarProps = {
  email: string;
  isSidebarCollapsed: boolean;
  onOpenSidebar: () => void;
  onToggleSidebar: () => void;
};

export function AdminTopbar({
  email,
  isSidebarCollapsed,
  onOpenSidebar,
  onToggleSidebar,
}: AdminTopbarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-slate-950/90 px-3 py-3 backdrop-blur-xl sm:px-4 md:px-5 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-200 transition hover:border-sky-400/60 hover:text-sky-200 md:hidden"
            aria-label="Open navigation menu"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-200 transition hover:border-sky-400/60 hover:text-sky-200 md:inline-flex xl:hidden"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className={`h-4 w-4 fill-none stroke-current stroke-2 transition-transform ${
                isSidebarCollapsed ? "rotate-180" : ""
              }`}
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
              Admin Control Center
            </p>
            <h1 className="text-base font-semibold text-slate-100 sm:text-lg">Platform Administration</h1>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <p className="hidden max-w-[220px] truncate rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs text-slate-300 lg:block">
            {email}
          </p>
          <AdminThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="min-h-10 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:border-rose-400 hover:text-rose-100 disabled:opacity-60"
          >
            {loading ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}

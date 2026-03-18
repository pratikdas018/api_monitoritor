"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

type AdminShellProps = {
  email: string;
  children: React.ReactNode;
};

export function AdminShell({ email, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
      if (window.innerWidth >= 1280) {
        setSidebarCollapsed(false);
      }
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const contentOffset = sidebarCollapsed ? "md:ml-24 xl:ml-72" : "md:ml-64 xl:ml-72";
  const sidebarWidth = sidebarCollapsed ? "md:w-24 xl:w-72" : "md:w-64 xl:w-72";

  return (
    <div className="admin-shell min-h-screen bg-slate-950 text-slate-100">
      <div
        className={`fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800/70 bg-slate-950/95 shadow-2xl shadow-black/40 transition-all duration-300 ease-out md:translate-x-0 ${sidebarWidth} ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar collapsed={sidebarCollapsed} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <div className={`min-h-screen transition-[margin-left] duration-300 ${contentOffset}`}>
        <AdminTopbar
          email={email}
          isSidebarCollapsed={sidebarCollapsed}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  );
}

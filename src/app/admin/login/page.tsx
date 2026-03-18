import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSessionFromCookies } from "@/lib/adminAuth";

type AdminLoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getAdminSessionFromCookies();
  if (session) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-3 py-6 sm:px-4 sm:py-10">
      <section className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/65 p-5 shadow-2xl shadow-slate-950/70 sm:rounded-3xl sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Secure Access</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100 sm:text-3xl">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in with admin credentials to access platform-wide controls.
        </p>

        <div className="mt-6">
          <AdminLoginForm nextPath={searchParams?.next} />
        </div>
      </section>
    </main>
  );
}

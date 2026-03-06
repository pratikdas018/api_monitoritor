import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUserId } from "@/lib/serverSession";

export default function ProfilePage() {
  const userId = getSessionUserId();
  if (!userId) {
    redirect("/login?next=/profile");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="glass-panel rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-100">Account</h1>
        <div className="mt-5 rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">User ID</p>
          <p className="mt-2 break-all text-sm text-slate-200">{userId}</p>
        </div>
        <div className="mt-5">
          <Link href="/dashboard" className="btn-soft">
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

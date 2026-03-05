import Link from "next/link";

import { GoogleAuthPanel } from "@/components/login/GoogleAuthPanel";
import { LoginForm } from "@/components/login/LoginForm";

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = searchParams?.next ?? "/dashboard";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-md items-center px-4 py-8 sm:px-6">
      <section className="glass-panel w-full rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Secure Access</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-100">Login</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access your monitoring dashboard.
        </p>

        <div className="mt-6">
          <LoginForm nextPath={nextPath} />
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-700/70" />
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">or</span>
          <span className="h-px flex-1 bg-slate-700/70" />
        </div>

        <GoogleAuthPanel nextPath={nextPath} />

        <p className="mt-4 text-xs text-slate-500">
          Need platform overview?{" "}
          <Link href="/" className="text-sky-300 hover:text-sky-200">
            Go to Landing Page
          </Link>
        </p>
      </section>
    </main>
  );
}

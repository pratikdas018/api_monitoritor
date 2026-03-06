import Link from "next/link";

export function AppFooter() {
  const year = new Date().getFullYear();
  const githubUrl =
    process.env.NEXT_PUBLIC_GITHUB_URL ??
    "https://github.com/pratikdas018/api_monitoritor";

  return (
    <footer className="border-t border-slate-800/80 bg-[linear-gradient(180deg,rgba(2,6,23,0.6),rgba(2,6,23,0.95))] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-6 sm:px-6 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <p className="text-sm font-semibold text-slate-100">API Monitor Platform</p>
          <p className="text-sm text-slate-400">
            Continuous uptime monitoring with incident visibility.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-2">
          <Link href="/" className="btn-soft">
            Home
          </Link>
          <Link href="/login" className="btn-soft">
            Login
          </Link>
          <Link href="/dashboard" className="btn-soft">
            Dashboard
          </Link>
          <Link href="/status" className="btn-soft">
            Status Page
          </Link>
          <Link href="/incidents" className="btn-soft">
            Incidents
          </Link>
          <a href={githubUrl} target="_blank" rel="noreferrer" className="btn-soft">
            GitHub
          </a>
        </nav>

        <div className="text-xs text-slate-500">
          <p>Copyright {year} API Monitor Platform. All rights reserved.</p>
          <p>Developed by pratik.</p>
        </div>
      </div>
    </footer>
  );
}

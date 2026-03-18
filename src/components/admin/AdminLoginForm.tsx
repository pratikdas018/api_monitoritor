"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AdminLoginFormProps = {
  nextPath?: string;
};

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectPath = useMemo(() => {
    if (!nextPath || !nextPath.startsWith("/")) return "/admin";
    return nextPath;
  }, [nextPath]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      setLoading(true);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Admin login failed");
        return;
      }

      router.replace(redirectPath);
      router.refresh();
    } catch {
      setError("Unable to reach admin login endpoint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
          Admin Email
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
          placeholder="admin@company.com"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
          Password
        </label>
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
          placeholder="********"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="min-h-11 w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:from-sky-400 hover:to-blue-400 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In as Admin"}
      </button>

      {error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </form>
  );
}

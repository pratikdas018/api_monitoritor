"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function CtaSection() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const showGuestLogin = status !== "loading" && !isAuthenticated;

  return (
    <section id="cta" className="glass-card rounded-2xl border p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary sm:text-3xl">
            Start Monitoring Your APIs Today
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Launch distributed checks, catch incidents early, and keep your services reliable.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {showGuestLogin ? (
            <Link
              href="/login"
              className="btn-primary px-5 py-2.5 text-sm font-semibold"
            >
              Login
            </Link>
          ) : null}
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className={showGuestLogin ? "btn-soft" : "btn-primary px-5 py-2.5 text-sm font-semibold"}
          >
            {isAuthenticated ? "Open Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>
    </section>
  );
}

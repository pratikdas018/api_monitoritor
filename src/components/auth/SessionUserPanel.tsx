"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export function SessionUserPanel() {
  const { data: session, status } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  if (status === "loading") {
    return (
      <div className="w-full rounded-btn border border-border-accent bg-accent/10 px-3 py-2 text-xs text-text-muted sm:w-auto">
        Loading session...
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const provider =
    session.user.provider?.charAt(0).toUpperCase() +
      (session.user.provider?.slice(1) ?? "") || "Unknown";

  return (
    <div className="glass-card flex w-full min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 sm:w-auto sm:max-w-[26rem] sm:gap-3 sm:px-3">
      {session.user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt={session.user.name || session.user.email || "User"}
          className="h-8 w-8 shrink-0 rounded-full border border-accent/70 object-cover sm:h-9 sm:w-9"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/70 bg-accent/15 text-xs text-accent-bright sm:h-9 sm:w-9">
          {(session.user.name || session.user.email || "U").slice(0, 1).toUpperCase()}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-text-primary">
          {session.user.name || "Signed-in user"}
        </p>
        <p className="truncate text-[11px] text-text-secondary">
          {session.user.email || "No email"}
        </p>
        <p className="hidden text-[10px] uppercase tracking-[0.08em] text-text-muted sm:block">
          {provider}
        </p>
      </div>

      <button
        type="button"
        onClick={async () => {
          try {
            setLoggingOut(true);
            await signOut({ callbackUrl: "/login" });
          } finally {
            setLoggingOut(false);
          }
        }}
        disabled={loggingOut}
        className="shrink-0 rounded-btn border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-300 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60 sm:px-2.5"
      >
        {loggingOut ? "..." : "Log out"}
      </button>
    </div>
  );
}

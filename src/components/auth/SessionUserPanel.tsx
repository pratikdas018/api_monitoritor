"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export function SessionUserPanel() {
  const { data: session, status } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  if (status === "loading") {
    return (
      <div className="rounded-btn border border-border-accent bg-accent/10 px-3 py-2 text-xs text-text-muted">
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
    <div className="glass-card flex items-center gap-3 rounded-xl border px-3 py-2">
      {session.user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt={session.user.name || session.user.email || "User"}
          className="h-9 w-9 rounded-full border border-accent/70 object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/70 bg-accent/15 text-xs text-accent-bright">
          {(session.user.name || session.user.email || "U").slice(0, 1).toUpperCase()}
        </span>
      )}

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-text-primary">
          {session.user.name || "Signed-in user"}
        </p>
        <p className="truncate text-[11px] text-text-secondary">
          {session.user.email || "No email"} - {provider}
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
        className="rounded-btn border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loggingOut ? "..." : "Logout"}
      </button>
    </div>
  );
}

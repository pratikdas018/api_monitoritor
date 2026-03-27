"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

function getInitials(value: string) {
  const clean = value.trim();
  if (!clean) return "U";
  const parts = clean.split(/[\s._-]+/g).filter(Boolean);
  if (parts.length === 0) return clean.slice(0, 1).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.trim() ||
    session?.user?.id?.trim() ||
    "User";
  const displayEmail = session?.user?.email?.trim() || "No email";
  const avatarUrl = session?.user?.image || "";
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    try {
      setLoading(true);
      await signOut({
        callbackUrl: "/login",
      });
      setOpen(false);
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/70 px-2.5 py-1.5 text-sm font-medium text-slate-200 transition hover:border-sky-400/70 hover:text-sky-200"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-sky-400/40 bg-sky-500/15 text-xs font-semibold text-sky-200">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName || "User avatar"}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            initials
          )}
        </span>
        <span className="hidden max-w-[150px] truncate text-xs text-slate-300 sm:inline">
          {displayName}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/95 p-1.5 shadow-2xl shadow-slate-950/70"
        >
          <div className="mb-1 rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2">
            <p className="truncate text-xs font-semibold text-slate-100">{displayName}</p>
            <p className="truncate text-[11px] text-slate-400">{displayEmail}</p>
          </div>
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800/80 hover:text-sky-200"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800/80 hover:text-sky-200"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            role="menuitem"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

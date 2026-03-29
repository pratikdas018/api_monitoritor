"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "apm_admin_theme";

export function AdminThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next = stored === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("admin-light", next === "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("admin-light", next === "light");
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="min-h-10 rounded-lg border border-border-accent bg-surface-card/70 px-3 py-2 text-xs font-semibold text-text-secondary transition hover:border-accent/70 hover:text-accent-bright"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}


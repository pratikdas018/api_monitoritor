export function formatDateTime(value: string | Date | null) {
  if (!value) return "Never";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const displayTimeZone =
    process.env.NEXT_PUBLIC_DISPLAY_TIMEZONE ||
    process.env.DISPLAY_TIMEZONE ||
    "Asia/Kolkata";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: displayTimeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }
}

export function formatDurationMs(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return `${Math.round(value)} ms`;
}

export function formatUptime(value: number) {
  if (Number.isNaN(value)) {
    return "0.00%";
  }

  return `${value.toFixed(2)}%`;
}

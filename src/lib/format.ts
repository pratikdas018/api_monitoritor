export function formatDateTime(value: string | Date | null) {
  if (!value) return "Never";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

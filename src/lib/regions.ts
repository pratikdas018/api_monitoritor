import type { MonitorRegion } from "@/models/Monitor";

const DEFAULT_REGIONS: MonitorRegion[] = ["India", "US", "Europe"];

function isMonitorRegion(value: string): value is MonitorRegion {
  return value === "India" || value === "US" || value === "Europe";
}

export function getMonitoringRegions(): MonitorRegion[] {
  const env = process.env.MONITOR_REGIONS?.trim();
  if (!env) return DEFAULT_REGIONS;

  const parsed = env
    .split(",")
    .map((value) => value.trim())
    .filter(isMonitorRegion);

  return parsed.length > 0 ? parsed : DEFAULT_REGIONS;
}

export function getRegionLatencyJitterMs(region: MonitorRegion) {
  switch (region) {
    case "India":
      return 20;
    case "US":
      return 45;
    case "Europe":
      return 35;
    default:
      return 0;
  }
}

type HistoryEntry = {
  success: boolean;
};

type UptimeCalculationInput = {
  totalChecks?: number | null;
  failureCount?: number | null;
  monitoringHistory?: HistoryEntry[] | null;
  incidentFailureCount?: number | null;
};

export const SLA_TARGETS = [99, 99.9, 99.99] as const;

export type SLATarget = (typeof SLA_TARGETS)[number];
export type SLAStatus = "MET" | "BREACHED";

export function calculateUptimePercentage(input: UptimeCalculationInput) {
  const historyChecks = input.monitoringHistory?.length ?? 0;
  const historyFailures =
    input.monitoringHistory?.filter((entry) => !entry.success).length ?? 0;
  const incidentFailures = Math.max(0, input.incidentFailureCount ?? 0);

  const checksFromTotals =
    input.totalChecks !== undefined && input.totalChecks !== null
      ? Math.max(0, input.totalChecks)
      : 0;

  const failuresFromTotals =
    input.failureCount !== undefined && input.failureCount !== null
      ? Math.max(0, input.failureCount)
      : -1;

  let totalChecks = checksFromTotals > 0 ? checksFromTotals : historyChecks;
  let failureCount =
    failuresFromTotals >= 0
      ? failuresFromTotals
      : historyChecks > 0
        ? historyFailures
        : incidentFailures;

  failureCount = Math.max(failureCount, incidentFailures);
  totalChecks = Math.max(totalChecks, failureCount);

  if (totalChecks <= 0) {
    return 100;
  }

  const uptime =
    ((totalChecks - Math.min(failureCount, totalChecks)) / totalChecks) * 100;

  return Number(uptime.toFixed(2));
}

export function getSLAStatus(
  uptimePercentage: number,
  target: SLATarget,
): SLAStatus {
  return uptimePercentage >= target ? "MET" : "BREACHED";
}

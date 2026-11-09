import { RISK_LEVEL_ORDER, RISK_LEVELS, UNKNOWN_RISK } from "@/constants/trips";
import type { RiskLevelDetails, RouteRiskSummary } from "@/types/trips";

export type RiskBreakdownPart = RiskLevelDetails & { miles: number };

/**
 * Miles per risk level, Low to No travel, in the order the risk bar draws them.
 * "No forecast" is only added when part of the route has no forecast.
 * Shared by the risk bar and its legend so the two always line up.
 */
export function getRiskBreakdown({ risk }: { risk: RouteRiskSummary }): RiskBreakdownPart[] {
  const levels = RISK_LEVEL_ORDER.map((level) => ({ ...RISK_LEVELS[level], miles: risk.miles_by_level[level] }));
  return risk.unknown_miles > 0 ? [...levels, { ...UNKNOWN_RISK, miles: risk.unknown_miles }] : levels;
}

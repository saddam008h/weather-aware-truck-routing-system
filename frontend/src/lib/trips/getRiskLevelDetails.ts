import { RISK_LEVELS, UNKNOWN_RISK } from "@/constants/trips";
import type { RiskLevel } from "@/types/trips";

/** Label and colors for a risk level, or the "No forecast" style when there's no level. */
export function getRiskLevelDetails({ level }: { level: RiskLevel | null | undefined }) {
  return level ? RISK_LEVELS[level] : UNKNOWN_RISK;
}

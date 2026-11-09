import { RISK_LEVELS } from "@/constants/trips";
import type { CheckpointRisk } from "@/types/trips";

const FACTORS = [
  { key: "wind", label: "Wind" },
  { key: "rain", label: "Rain" },
  { key: "snow", label: "Snow" },
] as const;

/** "Wind: High · Rain: Low · Snow: Low", so it's clear which factor drives a checkpoint's risk. */
export function describeRiskFactors({ risk }: { risk: CheckpointRisk }) {
  return FACTORS.map(({ key, label }) => `${label}: ${RISK_LEVELS[risk[key]].label}`).join(" · ");
}

import { RISK_FACTORS, RISK_LEVELS } from "@/constants/trips";
import type { CheckpointRisk } from "@/types/trips";
import { formatToLocaleNumber } from "@/utils";

/**
 * Why a checkpoint has its risk level, in one sentence:
 * "High because of rain." or
 * "Severe because of wind. The 42,000 lb load raises the wind risk."
 */
export function describeRiskCause({ risk, loadWeightLbs }: { risk: CheckpointRisk; loadWeightLbs: number }) {
  if (risk.level === "low") {
    return "Wind, rain and snow are all Low.";
  }

  const causes = RISK_FACTORS.filter(({ key }) => risk[key] === risk.level).map(({ key }) => key);
  // "wind", "wind and rain", "wind, rain and snow"
  const names = causes.length > 1 ? `${causes.slice(0, -1).join(", ")} and ${causes.at(-1)}` : causes[0];
  const sentence = `${RISK_LEVELS[risk.level].label} because of ${names}.`;

  // The load rules only ever raise the wind level, so they only matter when wind is a cause.
  if (risk.load_adjusted && causes.includes("wind")) {
    // A no-break space keeps "42,000 lb" from wrapping apart in the narrow map popup.
    return `${sentence} The ${formatToLocaleNumber({ value: loadWeightLbs })}\u00a0lb load raises the wind risk.`;
  }
  return sentence;
}

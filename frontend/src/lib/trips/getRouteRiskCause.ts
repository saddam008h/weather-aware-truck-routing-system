import { RISK_FACTORS } from "@/constants/trips";
import type { TripRoute } from "@/types/trips";

/**
 * What put a route at its worst risk level: the weather factors behind the
 * checkpoints at that level, and whether the load weight played a part.
 * Null when the whole route is Low.
 */
export function getRouteRiskCause({ route }: { route: TripRoute }) {
  const level = route.risk.worst_level;
  if (level === "low") {
    return null;
  }

  const worst = route.checkpoints.flatMap(({ risk }) => (risk?.level === level ? [risk] : []));
  const factors = RISK_FACTORS.filter(({ key }) => worst.some((risk) => risk[key] === level));
  // The load rules only raise the wind level, so they only count when wind is one of the causes.
  const isLoadAdjusted = worst.some((risk) => risk.load_adjusted && risk.wind === level);

  return { level, factors, isLoadAdjusted };
}

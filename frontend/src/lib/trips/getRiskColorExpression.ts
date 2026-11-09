import type { ExpressionSpecification } from "maplibre-gl";

import { RISK_LEVELS, UNKNOWN_RISK } from "@/constants/trips";
import type { RiskLevel } from "@/types/trips";
import { getCssVar } from "@/utils";

const colorOf = (level: RiskLevel) => getCssVar({ name: RISK_LEVELS[level].colorVar });

/**
 * A map style expression that colors a feature by its `level` property, using
 * the risk colors from globals.css. Anything else (no forecast) gets the "unknown" grey.
 */
export function getRiskColorExpression(): ExpressionSpecification {
  return [
    "match",
    ["get", "level"],
    "low",
    colorOf("low"),
    "moderate",
    colorOf("moderate"),
    "high",
    colorOf("high"),
    "severe",
    colorOf("severe"),
    "no_travel",
    colorOf("no_travel"),
    getCssVar({ name: UNKNOWN_RISK.colorVar }),
  ];
}

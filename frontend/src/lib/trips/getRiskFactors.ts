import { RISK_FACTORS } from "@/constants/trips";
import type { CheckpointRisk, CheckpointWeather, RiskFactor, RiskFactorKey } from "@/types/trips";

// Same precision as the brief's risk table (and the API's values).
const FORMAT_VALUE: Record<RiskFactorKey, (weather: CheckpointWeather) => string> = {
  wind: (weather) => `${Math.round(weather.wind_mph)} mph`,
  rain: (weather) => `${weather.rain_in_hr.toFixed(2)} in/hr`,
  snow: (weather) => `${weather.snow_in_hr.toFixed(1)} in/hr`,
};

/**
 * Wind, rain and snow at a checkpoint, each with its value and its own risk level.
 *
 * A checkpoint's level is the worst of the three, so the factor (or factors)
 * at that level is what caused it. A Low checkpoint has no cause to point at.
 */
export function getRiskFactors({ weather, risk }: { weather: CheckpointWeather; risk: CheckpointRisk }): RiskFactor[] {
  return RISK_FACTORS.map(({ key, label }) => ({
    key,
    label,
    value: FORMAT_VALUE[key](weather),
    level: risk[key],
    isCause: risk.level !== "low" && risk[key] === risk.level,
  }));
}

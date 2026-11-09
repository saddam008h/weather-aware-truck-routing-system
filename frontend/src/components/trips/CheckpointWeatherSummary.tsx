import { RISK_LEVELS } from "@/constants/trips";
import { getRiskFactors } from "@/lib/trips";
import type { CheckpointRisk, CheckpointWeather } from "@/types/trips";
import { cn } from "@/utils";

interface CheckpointWeatherSummaryProps {
  weather: CheckpointWeather | null;
  risk: CheckpointRisk | null;
}

/**
 * One line of forecast values: "Wind 18 mph · Rain 0.30 in/hr · Snow 0.0 in/hr · 54°F".
 * The value that set the risk level is tinted like the risk badge, so the cause is easy to spot.
 */
export function CheckpointWeatherSummary({ weather, risk }: CheckpointWeatherSummaryProps) {
  if (!weather || !risk) {
    return <span className="text-xs text-text-tertiary">Forecast doesn't reach this ETA yet</span>;
  }

  return (
    <span className="flex flex-wrap items-center gap-x-md gap-y-xxs text-xs text-text-secondary">
      {getRiskFactors({ weather, risk }).map((factor) => (
        <span
          key={factor.key}
          className={cn(
            // relative: sr-only text is absolutely positioned, and without an anchor here it lands
            // at its spot far down the scrolled list and makes the whole page scroll.
            "relative",
            factor.isCause && ["rounded-sm px-xs font-medium", RISK_LEVELS[factor.level].badgeClassName],
          )}
        >
          {factor.label} {factor.value}
          {factor.isCause && <span className="sr-only"> (sets the risk level)</span>}
        </span>
      ))}
      <span>{Math.round(weather.temperature_f)}°F</span>
    </span>
  );
}

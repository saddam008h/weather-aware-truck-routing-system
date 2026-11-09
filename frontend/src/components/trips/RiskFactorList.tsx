import { RiskBadge } from "@/components/trips/RiskBadge";
import { getRiskFactors } from "@/lib/trips";
import type { CheckpointRisk, CheckpointWeather } from "@/types/trips";
import { cn } from "@/utils";

interface RiskFactorListProps {
  weather: CheckpointWeather;
  risk: CheckpointRisk;
}

/** Wind, rain and snow with each one's own risk level. The ones that set the checkpoint's level are emphasised. */
export function RiskFactorList({ weather, risk }: RiskFactorListProps) {
  return (
    <ul className="flex flex-col gap-xs" aria-label="Risk by weather factor">
      {getRiskFactors({ weather, risk }).map((factor) => (
        <li
          key={factor.key}
          className={cn(
            "flex items-center justify-between gap-md text-xs",
            factor.isCause ? "font-medium text-text-primary" : "text-text-secondary",
          )}
        >
          <span>
            {factor.label} {factor.value}
          </span>
          <RiskBadge level={factor.level} />
        </li>
      ))}
    </ul>
  );
}

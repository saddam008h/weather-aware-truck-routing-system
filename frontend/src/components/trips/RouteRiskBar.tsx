import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { getRiskBreakdown } from "@/lib/trips";
import type { RouteRiskSummary } from "@/types/trips";
import { cn, formatToLocaleNumber } from "@/utils";

interface RouteRiskBarProps {
  risk: RouteRiskSummary;
  totalMiles: number;
}

/**
 * One bar for the whole route, split into colored parts by how many miles fall
 * in each risk level. Hovering a part says which level it is and how much of the route.
 */
export function RouteRiskBar({ risk, totalMiles }: RouteRiskBarProps) {
  const parts = getRiskBreakdown({ risk })
    .filter((part) => part.miles > 0)
    .map((part) => ({ ...part, share: (part.miles / totalMiles) * 100 }));

  const describe = (part: (typeof parts)[number]) =>
    `${part.label}: ${formatToLocaleNumber({ value: part.miles })} mi (${Math.round(part.share)}% of the route)`;

  return (
    <span
      role="img"
      aria-label={`Miles by risk level. ${parts.map(describe).join(", ")}`}
      className="flex h-md w-full overflow-hidden rounded-full bg-background-tertiary"
    >
      {parts.map((part) => (
        <Tooltip key={part.label}>
          {/* asChild: the colored part itself is the trigger (a nested button isn't allowed inside the card). */}
          <TooltipTrigger asChild>
            <span
              className={cn("h-full", part.fillClassName)}
              // Width is data, so it can't be a fixed class.
              style={{ width: `${part.share}%` }}
            />
          </TooltipTrigger>
          <TooltipContent>{describe(part)}</TooltipContent>
        </Tooltip>
      ))}
    </span>
  );
}

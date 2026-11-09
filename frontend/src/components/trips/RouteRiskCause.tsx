import { RISK_LEVELS } from "@/constants/trips";
import { useTripsContext } from "@/contexts/tripsContext";
import { getRouteRiskCause } from "@/lib/trips";
import type { TripRoute } from "@/types/trips";
import { cn, formatToLocaleNumber } from "@/utils";

/**
 * "Due to [Wind] with a 42,000 lb load": what gave a route its worst risk level.
 * The factor is tinted like the route's risk badge, the same way the checkpoint list marks a cause.
 */
export function RouteRiskCause({ route }: { route: TripRoute }) {
  const { tripPlan } = useTripsContext();

  const cause = getRouteRiskCause({ route });
  if (!tripPlan || !cause || cause.factors.length === 0) {
    return null;
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-xs text-xs text-text-secondary">
      Due to
      {cause.factors.map(({ key, label }) => (
        <span key={key} className={cn("rounded-sm px-xs font-medium", RISK_LEVELS[cause.level].badgeClassName)}>
          {label}
        </span>
      ))}
      {cause.isLoadAdjusted && (
        // No-break space so "42,000 lb" never splits across lines.
        <span>with a {formatToLocaleNumber({ value: tripPlan.load_weight_lbs })}&nbsp;lb load</span>
      )}
    </span>
  );
}

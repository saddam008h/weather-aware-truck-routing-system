import { Truck } from "lucide-react";

import { RiskBadge } from "@/components/trips/RiskBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { useTripsContext } from "@/contexts/tripsContext";
import { useTruckPosition } from "@/hooks/trips";
import { describeRiskCause, getNearestCheckpoint } from "@/lib/trips";
import { formatToLocaleNumber, formatToWeekdayTime } from "@/utils";

/**
 * One line saying what the truck is doing at the slider hour, and how risky it
 * is right there. Also makes it clear why the truck stands still at the
 * destination while the forecast keeps going to +48h.
 */
export function TruckStatus() {
  const { tripPlan, selectedRoute } = useTripsContext();
  const position = useTruckPosition();

  if (!tripPlan || !selectedRoute || !position) {
    return null;
  }

  const messages = {
    waiting: `truck leaves ${formatToWeekdayTime({ date: tripPlan.departure_time })}`,
    driving: `truck at mile ${formatToLocaleNumber({ value: position.mile })} of ${formatToLocaleNumber({ value: selectedRoute.distance_miles })}`,
    arrived: `truck arrived ${formatToWeekdayTime({ date: selectedRoute.arrival_time })}`,
  };

  // Only while the truck is on the road: before departure or after arrival there's
  // no "where the truck is right now" risk worth showing.
  const isDriving = position.status === "driving";

  // The truck's time is the slider time, and each checkpoint's risk is taken at
  // its own ETA, so the nearest checkpoint tells us the risk where the truck is now.
  const { risk } = getNearestCheckpoint({ route: selectedRoute, mile: position.mile });

  return (
    <span className="flex flex-wrap items-center gap-xs text-xs text-text-brand">
      <Truck className="size-lg" />
      Route {selectedRoute.id} · {messages[position.status]}
      {isDriving && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help">
              <RiskBadge level={risk?.level} />
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-c-xxs">
            Risk where the truck is at this hour.
            {risk
              ? ` ${describeRiskCause({ risk, loadWeightLbs: tripPlan.load_weight_lbs })}`
              : " The forecast doesn't reach this point yet."}
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}

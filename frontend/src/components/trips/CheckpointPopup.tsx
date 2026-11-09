import { Popup } from "react-map-gl/maplibre";

import { CheckpointWeatherSummary } from "@/components/trips/CheckpointWeatherSummary";
import { RiskBadge } from "@/components/trips/RiskBadge";
import { useTripsContext } from "@/contexts/tripsContext";
import { describeRiskFactors } from "@/lib/trips";
import type { CheckpointSelection } from "@/types/trips";
import { formatToLocaleNumber, formatToShortDateTime } from "@/utils";

/** Details for a hovered (or list-selected) checkpoint: ETA, forecast, and the risk behind it. */
export function CheckpointPopup({ selection }: { selection: CheckpointSelection }) {
  const { tripPlan } = useTripsContext();

  const route = tripPlan?.routes.find(({ id }) => id === selection.routeId);
  const checkpoint = route?.checkpoints[selection.index];
  if (!route || !checkpoint) {
    return null;
  }

  return (
    <Popup
      longitude={checkpoint.lon}
      latitude={checkpoint.lat}
      anchor="bottom"
      offset={12}
      closeButton={false}
      closeOnClick={false}
      maxWidth="none"
    >
      <div className="flex w-c-xxs flex-col gap-sm p-lg">
        <div className="flex items-center justify-between gap-md">
          <span className="text-sm font-semibold text-text-primary">
            Route {route.id} · Mile {formatToLocaleNumber({ value: checkpoint.mile })}
          </span>
          <RiskBadge level={checkpoint.risk?.level} />
        </div>

        <span className="text-xs text-text-secondary">ETA {formatToShortDateTime({ date: checkpoint.eta })}</span>
        <CheckpointWeatherSummary weather={checkpoint.weather} />

        {checkpoint.risk && (
          <span className="text-xs text-text-tertiary">{describeRiskFactors({ risk: checkpoint.risk })}</span>
        )}
        {checkpoint.risk?.load_adjusted && (
          <span className="text-xs text-text-warning">Wind risk raised because of the load weight.</span>
        )}
      </div>
    </Popup>
  );
}

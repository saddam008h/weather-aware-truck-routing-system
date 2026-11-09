import { Popup } from "react-map-gl/maplibre";

import { RiskBadge } from "@/components/trips/RiskBadge";
import { RiskFactorList } from "@/components/trips/RiskFactorList";
import { useTripsContext } from "@/contexts/tripsContext";
import { describeRiskCause } from "@/lib/trips";
import type { CheckpointSelection } from "@/types/trips";
import { formatToLocaleNumber, formatToShortDateTime } from "@/utils";

/** Details for a hovered (or list-selected) checkpoint: ETA, why it has its risk level, and each factor's own level. */
export function CheckpointPopup({ selection }: { selection: CheckpointSelection }) {
  const { tripPlan } = useTripsContext();

  const route = tripPlan?.routes.find(({ id }) => id === selection.routeId);
  const checkpoint = route?.checkpoints[selection.index];
  if (!tripPlan || !route || !checkpoint) {
    return null;
  }

  const { weather, risk } = checkpoint;

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
          <RiskBadge level={risk?.level} />
        </div>

        <span className="text-xs text-text-secondary">
          ETA {formatToShortDateTime({ date: checkpoint.eta })}
          {weather && ` · ${Math.round(weather.temperature_f)}°F`}
        </span>

        {weather && risk ? (
          <>
            <p className="text-xs font-medium text-text-primary">
              {describeRiskCause({ risk, loadWeightLbs: tripPlan.load_weight_lbs })}
            </p>
            <RiskFactorList weather={weather} risk={risk} />
          </>
        ) : (
          <span className="text-xs text-text-tertiary">Forecast doesn't reach this ETA yet</span>
        )}
      </div>
    </Popup>
  );
}

import { ForecastPlaybackControls } from "@/components/trips/ForecastPlaybackControls";
import { ForecastStatus } from "@/components/trips/ForecastStatus";
import { HeatmapLegend } from "@/components/trips/HeatmapLegend";
import { HeatmapMetricSelect } from "@/components/trips/HeatmapMetricSelect";
import { TruckStatus } from "@/components/trips/TruckStatus";
import { Slider } from "@/components/ui";
import { FORECAST_HOURS } from "@/constants/trips";
import { useTripForecastContext, useTripsContext } from "@/contexts/tripsContext";
import { getForecastTime } from "@/lib/trips";
import { formatToShortDateTime } from "@/utils";

const SLIDER_TICKS = [0, 12, 24, 36, 48];

/** Floating panel over the map: playback controls, the 0-48h forecast slider, what the heatmap shows and its legend. */
export function ForecastPanel() {
  const { tripPlan, tripHeatmap } = useTripsContext();
  const { forecastHour, setForecastHour, heatmapMetric } = useTripForecastContext();

  if (!tripPlan) {
    return null;
  }

  const forecastTime = getForecastTime({ departureTime: tripPlan.departure_time, hour: forecastHour });

  return (
    <div className="absolute inset-x-md bottom-md z-10 mx-auto flex max-w-c-lg flex-col gap-md rounded-xl border border-border-primary bg-background-overlay p-lg shadow-lg md:inset-x-xl md:bottom-xl">
      {/* Top-aligned: the buttons and dropdown line up with the first line of text, not its middle. */}
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex items-start gap-md">
          {/* Nothing to play until the weather grid is in. */}
          <ForecastPlaybackControls disabled={!tripHeatmap} />
          <div className="flex flex-col">
            <span className="text-xs text-text-tertiary">Corridor forecast · departure +{forecastHour} h</span>
            <span className="text-sm font-medium text-text-primary">
              {formatToShortDateTime({ date: forecastTime })}
            </span>
            <TruckStatus />
          </div>
        </div>

        <HeatmapMetricSelect />
      </div>

      <div className="flex flex-col gap-xxs">
        <Slider
          aria-label="Forecast hour"
          min={0}
          max={FORECAST_HOURS}
          step={1}
          value={[forecastHour]}
          onValueChange={([hour]) => setForecastHour(hour)}
        />
        <div className="flex justify-between text-xxs text-text-tertiary" aria-hidden>
          {SLIDER_TICKS.map((tick) => (
            <span key={tick}>{tick}h</span>
          ))}
        </div>
      </div>

      {tripHeatmap ? <HeatmapLegend metric={heatmapMetric} /> : <ForecastStatus />}
    </div>
  );
}

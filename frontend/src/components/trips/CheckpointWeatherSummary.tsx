import type { CheckpointWeather } from "@/types/trips";

/** One line of forecast values: "Wind 18 mph · Rain 0.12 in/hr · Snow 0 in/hr · 54°F". */
export function CheckpointWeatherSummary({ weather }: { weather: CheckpointWeather | null }) {
  if (!weather) {
    return <span className="text-xs text-text-tertiary">Forecast doesn't reach this ETA yet</span>;
  }

  return (
    <span className="flex flex-wrap gap-x-md gap-y-xxs text-xs text-text-secondary">
      <span>Wind {Math.round(weather.wind_mph)} mph</span>
      <span>Rain {weather.rain_in_hr.toFixed(2)} in/hr</span>
      <span>Snow {weather.snow_in_hr.toFixed(1)} in/hr</span>
      <span>{Math.round(weather.temperature_f)}°F</span>
    </span>
  );
}

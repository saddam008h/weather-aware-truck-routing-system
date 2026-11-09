import { useEffect } from "react";

import { FORECAST_HOURS, FORECAST_PLAYBACK_STEP_MS } from "@/constants/trips";
import { useTripForecastContext } from "@/contexts/tripsContext";

/**
 * Play/pause/stop for the forecast slider. Steps one hour at a time and stops at
 * the last hour, like a video reaching its end; playing again from there starts over.
 * Stop pauses and rewinds to the departure hour.
 *
 * The playing flag lives in the trips context, so planning a new trip can stop it.
 */
export function useForecastPlayback() {
  const { forecastHour, setForecastHour, isForecastPlaying, setIsForecastPlaying } = useTripForecastContext();

  // Each step schedules the next one, so dragging the slider mid-play just
  // carries on from the new hour.
  useEffect(() => {
    if (!isForecastPlaying) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextHour = Math.min(forecastHour + 1, FORECAST_HOURS);
      setForecastHour(nextHour);
      if (nextHour === FORECAST_HOURS) {
        setIsForecastPlaying(false);
      }
    }, FORECAST_PLAYBACK_STEP_MS);

    return () => window.clearTimeout(timer);
  }, [isForecastPlaying, forecastHour, setForecastHour, setIsForecastPlaying]);

  const togglePlayback = () => {
    if (isForecastPlaying) {
      setIsForecastPlaying(false);
      return;
    }
    if (forecastHour >= FORECAST_HOURS) {
      setForecastHour(0);
    }
    setIsForecastPlaying(true);
  };

  // Stop is "pause + rewind": back to the departure hour.
  const stopPlayback = () => {
    setIsForecastPlaying(false);
    setForecastHour(0);
  };

  return { forecastHour, isPlaying: isForecastPlaying, togglePlayback, stopPlayback };
}

import { Pause, Play, Square } from "lucide-react";

import { Button } from "@/components/ui";
import { FORECAST_HOURS } from "@/constants/trips";
import { useForecastPlayback } from "@/hooks/trips";

// The play button's label says what pressing it will do right now.
const getPlayLabel = ({ isPlaying, hour }: { isPlaying: boolean; hour: number }) => {
  if (isPlaying) {
    return "Pause";
  }
  if (hour === 0) {
    return "Play forecast";
  }
  if (hour >= FORECAST_HOURS) {
    return "Replay from departure";
  }
  return "Resume";
};

/** Play/pause and stop for the forecast slider. `disabled` until the weather grid has loaded. */
export function ForecastPlaybackControls({ disabled }: { disabled: boolean }) {
  const { forecastHour, isPlaying, togglePlayback, stopPlayback } = useForecastPlayback();

  const playLabel = getPlayLabel({ isPlaying, hour: forecastHour });
  const stopLabel = "Stop and reset to departure";

  return (
    <div className="flex gap-xs">
      <Button
        variant="secondary"
        size="icon"
        aria-label={playLabel}
        tooltip={playLabel}
        disabled={disabled}
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      {/* Greyed out when already stopped at the departure hour: nothing to reset. */}
      <Button
        variant="secondary"
        size="icon"
        aria-label={stopLabel}
        tooltip={stopLabel}
        disabled={disabled || (!isPlaying && forecastHour === 0)}
        onClick={stopPlayback}
      >
        <Square />
      </Button>
    </div>
  );
}

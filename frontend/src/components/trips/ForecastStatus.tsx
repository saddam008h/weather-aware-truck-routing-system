import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui";
import { useTripsContext } from "@/contexts/tripsContext";

/** Shown in place of the legend while the weather grid loads, or if it failed. */
export function ForecastStatus() {
  const { isTripHeatmapLoading, isTripHeatmapError, refetchTripHeatmap } = useTripsContext();

  if (isTripHeatmapError) {
    return (
      <div className="flex items-center justify-between gap-md text-xs text-text-danger">
        Couldn't load the weather grid.
        <Button variant="secondary" size="sm" onClick={() => refetchTripHeatmap()}>
          Try again
        </Button>
      </div>
    );
  }

  if (isTripHeatmapLoading) {
    return (
      <div className="flex items-center gap-sm text-xs text-text-secondary">
        <LoaderCircle className="size-lg animate-spin" />
        Loading the weather grid along the corridor...
      </div>
    );
  }

  return null;
}

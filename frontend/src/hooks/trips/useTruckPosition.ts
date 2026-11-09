import { useMemo } from "react";

import { useTripForecastContext, useTripsContext } from "@/contexts/tripsContext";
import { getForecastTime, getTruckPosition } from "@/lib/trips";

/** Where the truck is on the selected route at the hour the forecast slider points to. Null before a trip is planned. */
export function useTruckPosition() {
  const { tripPlan, selectedRoute } = useTripsContext();
  const { forecastHour } = useTripForecastContext();

  return useMemo(() => {
    if (!tripPlan || !selectedRoute) {
      return null;
    }
    const time = getForecastTime({ departureTime: tripPlan.departure_time, hour: forecastHour });
    return getTruckPosition({ route: selectedRoute, time });
  }, [tripPlan, selectedRoute, forecastHour]);
}

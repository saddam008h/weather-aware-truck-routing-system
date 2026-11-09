import { queryOptions, skipToken } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/shared";
import { getTripHeatmap } from "@/services/trips";
import type { TripRequest } from "@/types/trips";

/** The 0-48h weather grid for a planned trip. Waits (skipToken) until there is a request. */
export function getTripHeatmapQueryOptions({ request }: { request: TripRequest | null }) {
  return queryOptions({
    queryKey: [QUERY_KEYS.TRIP_HEATMAP, request],
    queryFn: request ? () => getTripHeatmap({ request }) : skipToken,
    // Forecasts move slowly; re-planning the same trip within a few minutes reuses the grid.
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

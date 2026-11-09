import { getCumulativeMiles } from "@/lib/trips/getCumulativeMiles";
import { getPointAtMile } from "@/lib/trips/getPointAtMile";
import type { LatLon, TripRoute } from "@/types/trips";

/** The point `position` of the way along a route (0 = start, 1 = end), for placing its map label. */
export function getRouteLabelPoint({ route, position }: { route: TripRoute; position: number }): LatLon {
  const miles = getCumulativeMiles({ points: route.geometry, totalMiles: route.distance_miles });
  return getPointAtMile({ points: route.geometry, miles, mile: route.distance_miles * position });
}

import { getCumulativeMiles } from "@/lib/trips/getCumulativeMiles";
import { getPointAtMile } from "@/lib/trips/getPointAtMile";
import type { TripRoute, TruckPosition } from "@/types/trips";

/**
 * Where the truck is on `route` at `time`.
 *
 * Checkpoint ETAs tell us which mile the truck has reached (interpolating
 * between them), and the route line turns that mile into a point on the road.
 */
export function getTruckPosition({ route, time }: { route: TripRoute; time: Date }): TruckPosition {
  const { checkpoints } = route;
  const target = time.getTime();
  const etas = checkpoints.map((checkpoint) => new Date(checkpoint.eta).getTime());

  let mile = 0;
  let status: TruckPosition["status"] = "driving";

  if (target <= etas[0]) {
    status = "waiting";
  } else if (target >= etas[etas.length - 1]) {
    mile = route.distance_miles;
    status = "arrived";
  } else {
    // The truck is between the last checkpoint it passed and the next one.
    const next = etas.findIndex((eta) => eta >= target);
    const previous = next - 1;
    const fraction = (target - etas[previous]) / (etas[next] - etas[previous]);
    mile = checkpoints[previous].mile + (checkpoints[next].mile - checkpoints[previous].mile) * fraction;
  }

  const miles = getCumulativeMiles({ points: route.geometry, totalMiles: route.distance_miles });
  const [lat, lon] = getPointAtMile({ points: route.geometry, miles, mile });

  // Which way the road runs here: compare a mile back with a mile ahead (clamped,
  // so it still works at the start and end of the route).
  const [, lonBehind] = getPointAtMile({ points: route.geometry, miles, mile: Math.max(mile - 1, 0) });
  const [, lonAhead] = getPointAtMile({
    points: route.geometry,
    miles,
    mile: Math.min(mile + 1, route.distance_miles),
  });

  return { lat, lon, mile, status, isHeadingWest: lonAhead < lonBehind };
}

import type { LatLon } from "@/types/trips";
import { getDistanceMiles } from "@/utils";

/**
 * Running distance along a route line to each of its points (first value is 0).
 *
 * The API simplifies the line before sending it, so its measured length comes
 * out a little shorter than the real road. Scaling to `totalMiles` keeps
 * positions on the line in step with the checkpoint miles.
 */
export function getCumulativeMiles({ points, totalMiles }: { points: LatLon[]; totalMiles: number }) {
  const miles = [0];
  for (let i = 1; i < points.length; i++) {
    miles.push(miles[i - 1] + getDistanceMiles({ from: points[i - 1], to: points[i] }));
  }

  const measured = miles[miles.length - 1];
  if (measured === 0) {
    return miles;
  }

  const scale = totalMiles / measured;
  return miles.map((mile) => mile * scale);
}

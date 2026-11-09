import type { LatLon } from "@/types/trips";

/**
 * The spot `mile` miles along a line. `miles` comes from getCumulativeMiles()
 * for the same points. Out-of-range miles snap to the ends.
 */
export function getPointAtMile({ points, miles, mile }: { points: LatLon[]; miles: number[]; mile: number }): LatLon {
  if (mile <= 0) {
    return points[0];
  }
  if (mile >= miles[miles.length - 1]) {
    return points[points.length - 1];
  }

  // The target sits between the first point at or past it and the point before that.
  const after = miles.findIndex((value) => value >= mile);
  const before = after - 1;
  const span = miles[after] - miles[before];
  const fraction = span > 0 ? (mile - miles[before]) / span : 0;

  return [
    points[before][0] + (points[after][0] - points[before][0]) * fraction,
    points[before][1] + (points[after][1] - points[before][1]) * fraction,
  ];
}

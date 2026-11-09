import type { Checkpoint, TripRoute } from "@/types/trips";

/**
 * The checkpoint closest to `mile` along the route. Each checkpoint stands for the
 * road nearest to it (same rule as the route colors and the API's mileage totals),
 * so its risk is the risk for that spot.
 */
export function getNearestCheckpoint({ route, mile }: { route: TripRoute; mile: number }): Checkpoint {
  return route.checkpoints.reduce((nearest, checkpoint) =>
    Math.abs(checkpoint.mile - mile) < Math.abs(nearest.mile - mile) ? checkpoint : nearest,
  );
}

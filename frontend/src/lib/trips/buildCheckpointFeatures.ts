import type { Feature, FeatureCollection, Point } from "geojson";

import type { CheckpointFeatureProperties, TripRoute } from "@/types/trips";

/** One map point per checkpoint on every route. `routeId` + `index` lead back to the full checkpoint. */
export function buildCheckpointFeatures({
  routes,
}: {
  routes: TripRoute[];
}): FeatureCollection<Point, CheckpointFeatureProperties> {
  const features = routes.flatMap((route) =>
    route.checkpoints.map((checkpoint, index): Feature<Point, CheckpointFeatureProperties> => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [checkpoint.lon, checkpoint.lat] },
      properties: { routeId: route.id, index, level: checkpoint.risk?.level ?? "unknown" },
    })),
  );

  return { type: "FeatureCollection", features };
}

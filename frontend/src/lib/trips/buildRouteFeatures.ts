import type { Feature, FeatureCollection, LineString } from "geojson";

import { getCumulativeMiles } from "@/lib/trips/getCumulativeMiles";
import { getPointAtMile } from "@/lib/trips/getPointAtMile";
import type { RouteFeatureProperties, TripRoute } from "@/types/trips";

/**
 * Splits every route into stretches, one per checkpoint, tagged with that
 * checkpoint's risk level so the map can color the line by risk.
 *
 * Same rule the API uses for its mileage totals: a checkpoint covers the road
 * from halfway back to the previous checkpoint to halfway on to the next one.
 */
export function buildRouteFeatures({
  routes,
}: {
  routes: TripRoute[];
}): FeatureCollection<LineString, RouteFeatureProperties> {
  const features = routes.flatMap((route) => {
    const { checkpoints, geometry } = route;
    const miles = getCumulativeMiles({ points: geometry, totalMiles: route.distance_miles });

    return checkpoints.map((checkpoint, index): Feature<LineString, RouteFeatureProperties> => {
      const start = index === 0 ? 0 : (checkpoints[index - 1].mile + checkpoint.mile) / 2;
      const end =
        index === checkpoints.length - 1 ? route.distance_miles : (checkpoint.mile + checkpoints[index + 1].mile) / 2;

      // Exact cut points at both ends, plus every line point in between.
      const stretch = [
        getPointAtMile({ points: geometry, miles, mile: start }),
        ...geometry.filter((_, pointIndex) => miles[pointIndex] > start && miles[pointIndex] < end),
        getPointAtMile({ points: geometry, miles, mile: end }),
      ];

      return {
        type: "Feature",
        // GeoJSON wants [lon, lat]; the API sends [lat, lon].
        geometry: { type: "LineString", coordinates: stretch.map(([lat, lon]) => [lon, lat]) },
        properties: { routeId: route.id, level: checkpoint.risk?.level ?? "unknown" },
      };
    });
  });

  return { type: "FeatureCollection", features };
}

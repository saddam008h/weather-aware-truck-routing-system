import type { LngLatBoundsLike } from "maplibre-gl";

import type { TripRoute } from "@/types/trips";

/** The box (west/south, east/north) that fits every route, for fitting the map to the trip. */
export function getRoutesBounds({ routes }: { routes: TripRoute[] }): LngLatBoundsLike {
  const points = routes.flatMap((route) => route.geometry);
  const latitudes = points.map(([lat]) => lat);
  const longitudes = points.map(([, lon]) => lon);

  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
}

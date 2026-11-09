import type { ExpressionSpecification } from "maplibre-gl";

import { HEATMAP_RADIUS_IN_CELLS } from "@/constants/trips";
import type { LatLon } from "@/types/trips";

// MapLibre draws the whole world 512px wide at zoom 0, doubling with each zoom level.
const WORLD_PIXELS_AT_ZOOM_0 = 512;
// Past this zoom the radius stops growing; drawing huge blobs is slow and nobody reads a heatmap that close.
const MAX_SCALED_ZOOM = 9;
const FALLBACK_RADIUS_PX = 24;

/**
 * Heatmap radius (in pixels) that spans about HEATMAP_RADIUS_IN_CELLS grid cells
 * at every zoom, so neighbouring cells always blend into one smooth surface.
 *
 * The API's grid cells are square on the map: `cellLat` degrees tall and
 * `cellLat / cos(latitude)` degrees of longitude wide.
 */
export function getHeatmapRadius({ points }: { points: LatLon[] }): ExpressionSpecification | number {
  const latitudes = [...new Set(points.map(([lat]) => lat))].sort((a, b) => a - b);
  const steps = latitudes.slice(1).map((lat, index) => lat - latitudes[index]);
  if (steps.length === 0) {
    return FALLBACK_RADIUS_PX;
  }

  const cellLat = Math.min(...steps);
  const midLat = (latitudes[0] + latitudes[latitudes.length - 1]) / 2;
  const cellLon = cellLat / Math.cos((midLat * Math.PI) / 180);
  const radiusAtZoom0 = ((cellLon * WORLD_PIXELS_AT_ZOOM_0) / 360) * HEATMAP_RADIUS_IN_CELLS;

  return [
    "interpolate",
    ["exponential", 2],
    ["zoom"],
    0,
    radiusAtZoom0,
    MAX_SCALED_ZOOM,
    radiusAtZoom0 * 2 ** MAX_SCALED_ZOOM,
  ];
}

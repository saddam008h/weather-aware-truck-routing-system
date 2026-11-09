import type { FeatureCollection, Point } from "geojson";

import { HEATMAP_METRICS } from "@/constants/trips";
import { getHeatmapHourProperty } from "@/lib/trips/getHeatmapHourProperty";
import type { HeatmapMetric, TripHeatmap } from "@/types/trips";
import { clamp } from "@/utils";

/**
 * One map point per grid cell, carrying a 0-1 weight for every forecast hour
 * (`h0` ... `h48`) of the chosen metric.
 *
 * With every hour baked in, moving the slider only changes which property the
 * heatmap layer reads. The data itself is uploaded to the map once, which is
 * what keeps scrubbing smooth.
 */
export function buildHeatmapFeatures({
  heatmap,
  metric,
}: {
  heatmap: TripHeatmap;
  metric: HeatmapMetric;
}): FeatureCollection<Point, Record<string, number>> {
  const { min, max } = HEATMAP_METRICS[metric];
  // Map the metric's value onto 0-1. Missing forecasts count as nothing to show.
  const toWeight = (value: number | null) =>
    value === null ? 0 : clamp({ value: (value - min) / (max - min), min: 0, max: 1 });

  const features = heatmap.points.map(([lat, lon], pointIndex) => {
    const properties: Record<string, number> = {};
    for (const frame of heatmap.frames) {
      properties[getHeatmapHourProperty({ hour: frame.hour })] = toWeight(frame[metric][pointIndex]);
    }

    return {
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [lon, lat] },
      properties,
    };
  });

  return { type: "FeatureCollection", features };
}

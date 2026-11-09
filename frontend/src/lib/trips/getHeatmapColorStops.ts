import { HEATMAP_METRICS } from "@/constants/trips";
import type { HeatmapMetric } from "@/types/trips";

/**
 * Where each of a metric's colors sits on its 0-1 weight scale. The map's
 * color ramp and the legend bar both read these, so a color on the map means
 * the same value it does in the legend.
 *
 * The colors are spread evenly up to the top of the scale, which for overall
 * risk puts them right on Moderate, High, Severe and No travel.
 */
export function getHeatmapColorStops({ metric }: { metric: HeatmapMetric }) {
  const { colorVars } = HEATMAP_METRICS[metric];

  return colorVars.map((cssVar, index) => ({ position: (index + 1) / colorVars.length, cssVar }));
}

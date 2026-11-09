import type { ExpressionSpecification } from "maplibre-gl";

import { HEATMAP_METRICS } from "@/constants/trips";
import type { HeatmapMetric } from "@/types/trips";
import { getCssVar } from "@/utils";

// Where each of the metric's four colors kicks in, on the heatmap's 0-1 density scale.
const COLOR_STOPS = [0.1, 0.35, 0.65, 0.95];

/** The heatmap-color expression for a metric, built from its color tokens in globals.css. */
export function getHeatmapColorRamp({ metric }: { metric: HeatmapMetric }): ExpressionSpecification {
  const colors = HEATMAP_METRICS[metric].colorVars.map((name) => getCssVar({ name }));
  const stops = COLOR_STOPS.flatMap((stop, index) => [stop, colors[index]]);

  return ["interpolate", ["linear"], ["heatmap-density"], 0, "transparent", ...stops];
}

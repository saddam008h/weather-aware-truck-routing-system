import type { ExpressionSpecification } from "maplibre-gl";

import { getHeatmapColorStops } from "@/lib/trips/getHeatmapColorStops";
import type { HeatmapMetric } from "@/types/trips";
import { getCssVar } from "@/utils";

/** The heatmap-color expression for a metric, built from its color tokens in globals.css. */
export function getHeatmapColorRamp({ metric }: { metric: HeatmapMetric }): ExpressionSpecification {
  const stops = getHeatmapColorStops({ metric }).flatMap(({ position, cssVar }) => [
    position,
    getCssVar({ name: cssVar }),
  ]);

  return ["interpolate", ["linear"], ["heatmap-density"], 0, "transparent", ...stops];
}

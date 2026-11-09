import { describe, expect, it } from "vitest";

import { HEATMAP_METRICS } from "@/constants/trips";
import { getHeatmapColorStops } from "@/lib/trips/getHeatmapColorStops";

describe("getHeatmapColorStops", () => {
  it("puts each overall risk color on its level", () => {
    const { max } = HEATMAP_METRICS.risk;
    const levels = getHeatmapColorStops({ metric: "risk" }).map(({ position }) => position * max);

    // Low (0) draws nothing; Moderate (1) through No travel (4) each get a color.
    expect(levels).toEqual([1, 2, 3, 4]);
  });

  it("ends every metric's scale on its last color", () => {
    const stops = getHeatmapColorStops({ metric: "wind_mph" });

    expect(stops.at(-1)).toEqual({ position: 1, cssVar: "--heatmap-wind-4" });
  });
});

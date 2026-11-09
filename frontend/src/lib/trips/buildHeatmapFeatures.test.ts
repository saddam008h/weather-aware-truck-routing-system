import { describe, expect, it } from "vitest";

import { buildHeatmapFeatures } from "@/lib/trips/buildHeatmapFeatures";
import { getHeatmapRadius } from "@/lib/trips/getHeatmapRadius";
import type { TripHeatmap } from "@/types/trips";

const heatmap: TripHeatmap = {
  start_time: "2026-01-05T08:00:00Z",
  points: [
    [40, -100],
    [40.25, -100],
  ],
  frames: [
    {
      hour: 0,
      time: "2026-01-05T08:00:00Z",
      risk: [0, 4],
      wind_mph: [5, 32.5],
      rain_in_hr: [0, 1],
      snow_in_hr: [null, 0],
    },
    {
      hour: 1,
      time: "2026-01-05T09:00:00Z",
      risk: [2, null],
      wind_mph: [60, 10],
      rain_in_hr: [0.25, 0],
      snow_in_hr: [0, 0],
    },
  ],
};

describe("buildHeatmapFeatures", () => {
  it("stores a 0-1 weight per hour for the chosen metric", () => {
    const { features } = buildHeatmapFeatures({ heatmap, metric: "risk" });

    expect(features[0].properties).toEqual({ h0: 0, h1: 0.5 });
    // Missing forecast -> nothing drawn.
    expect(features[1].properties).toEqual({ h0: 1, h1: 0 });
  });

  it("scales wind between the metric's min and max and clamps outside it", () => {
    const { features } = buildHeatmapFeatures({ heatmap, metric: "wind_mph" });

    expect(features[0].properties).toEqual({ h0: 0, h1: 1 });
    expect(features[1].properties.h0).toBeCloseTo(0.5);
  });

  it("puts features in [lon, lat] order", () => {
    const { features } = buildHeatmapFeatures({ heatmap, metric: "rain_in_hr" });

    expect(features[1].geometry.coordinates).toEqual([-100, 40.25]);
  });
});

describe("getHeatmapRadius", () => {
  it("grows with zoom so the blobs keep covering the same ground", () => {
    const radius = getHeatmapRadius({ points: heatmap.points });

    expect(radius).toEqual(["interpolate", ["exponential", 2], ["zoom"], 0, expect.any(Number), 9, expect.any(Number)]);
  });

  it("falls back to a fixed size when there's no grid to measure", () => {
    expect(getHeatmapRadius({ points: [] })).toBe(24);
  });
});

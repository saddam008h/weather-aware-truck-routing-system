import { describe, expect, it } from "vitest";

import { getHeatmapPeak } from "@/lib/trips/getHeatmapPeak";
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
      risk: [1, 3],
      wind_mph: [12, 41.5],
      rain_in_hr: [0, 0],
      snow_in_hr: [null, null],
    },
  ],
};

describe("getHeatmapPeak", () => {
  it("returns the worst value in the corridor at that hour", () => {
    expect(getHeatmapPeak({ heatmap, metric: "risk", hour: 0 })).toBe(3);
    expect(getHeatmapPeak({ heatmap, metric: "wind_mph", hour: 0 })).toBe(41.5);
  });

  it("returns null when nothing has a forecast, or the hour isn't there", () => {
    expect(getHeatmapPeak({ heatmap, metric: "snow_in_hr", hour: 0 })).toBeNull();
    expect(getHeatmapPeak({ heatmap, metric: "risk", hour: 30 })).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { buildRouteFeatures } from "@/lib/trips/buildRouteFeatures";
import { buildTestRoute } from "@/test/buildTestRoute";

describe("buildRouteFeatures", () => {
  const { features } = buildRouteFeatures({ routes: [buildTestRoute()] });

  it("makes one stretch per checkpoint, tagged with its risk", () => {
    expect(features.map((feature) => feature.properties.level)).toEqual(["low", "low", "severe", "unknown"]);
    expect(features.every((feature) => feature.properties.routeId === 1)).toBe(true);
  });

  it("cuts stretches halfway between checkpoints", () => {
    // Checkpoints at 50 and 100 miles meet at mile 75, a bit past the first one-degree hop.
    const severeStretch = features[2].geometry.coordinates;
    const [startLon, startLat] = severeStretch[0];

    expect(startLon).toBe(-100);
    expect(startLat).toBeCloseTo(40 + 75 / 69.1, 1);
  });

  it("lets neighbouring stretches meet without gaps", () => {
    for (let i = 1; i < features.length; i++) {
      const previousEnd = features[i - 1].geometry.coordinates.at(-1);
      const start = features[i].geometry.coordinates[0];
      expect(start).toEqual(previousEnd);
    }
  });
});

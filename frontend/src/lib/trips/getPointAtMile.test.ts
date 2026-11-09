import { describe, expect, it } from "vitest";

import { getCumulativeMiles } from "@/lib/trips/getCumulativeMiles";
import { getPointAtMile } from "@/lib/trips/getPointAtMile";
import { buildTestRoute } from "@/test/buildTestRoute";

describe("getCumulativeMiles", () => {
  it("scales the measured line to the route's reported length", () => {
    const { geometry } = buildTestRoute();
    const miles = getCumulativeMiles({ points: geometry, totalMiles: 150 });

    expect(miles[0]).toBe(0);
    expect(miles[1]).toBeCloseTo(75);
    expect(miles[2]).toBeCloseTo(150);
  });
});

describe("getPointAtMile", () => {
  const { geometry, distance_miles } = buildTestRoute();
  const miles = getCumulativeMiles({ points: geometry, totalMiles: distance_miles });

  it("interpolates between line points", () => {
    const [lat, lon] = getPointAtMile({ points: geometry, miles, mile: distance_miles / 4 });

    expect(lat).toBeCloseTo(40.5);
    expect(lon).toBe(-100);
  });

  it("snaps miles outside the route to its ends", () => {
    expect(getPointAtMile({ points: geometry, miles, mile: -5 })).toEqual([40, -100]);
    expect(getPointAtMile({ points: geometry, miles, mile: 999 })).toEqual([42, -100]);
  });
});

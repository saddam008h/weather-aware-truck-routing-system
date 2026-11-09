import { describe, expect, it } from "vitest";

import { getTruckPosition } from "@/lib/trips/getTruckPosition";
import { buildTestRoute } from "@/test/buildTestRoute";

describe("getTruckPosition", () => {
  const route = buildTestRoute();

  it("waits at the origin before departure", () => {
    const position = getTruckPosition({ route, time: new Date("2026-01-05T07:00:00Z") });

    expect(position).toMatchObject({ status: "waiting", mile: 0, lat: 40 });
  });

  it("interpolates the mile between checkpoint ETAs", () => {
    // Halfway between the 09:00 (mile 50) and 10:00 (mile 100) checkpoints.
    const position = getTruckPosition({ route, time: new Date("2026-01-05T09:30:00Z") });

    expect(position.status).toBe("driving");
    expect(position.mile).toBeCloseTo(75);
  });

  it("sits at the destination after arrival", () => {
    const position = getTruckPosition({ route, time: new Date("2026-01-05T15:00:00Z") });

    expect(position).toMatchObject({ status: "arrived", lat: 42 });
  });

  it("knows when the road heads west, including at both ends", () => {
    // Same route, but driving due west instead of north.
    const westbound = { ...route, geometry: route.geometry.map(([, lon], i): [number, number] => [40, lon - i]) };
    const eastbound = { ...route, geometry: route.geometry.map(([, lon], i): [number, number] => [40, lon + i]) };

    for (const time of ["2026-01-05T07:00:00Z", "2026-01-05T09:30:00Z", "2026-01-05T15:00:00Z"]) {
      expect(getTruckPosition({ route: westbound, time: new Date(time) }).isHeadingWest).toBe(true);
      expect(getTruckPosition({ route: eastbound, time: new Date(time) }).isHeadingWest).toBe(false);
    }
  });
});

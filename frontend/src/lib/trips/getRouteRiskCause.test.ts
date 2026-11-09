import { describe, expect, it } from "vitest";

import { getRouteRiskCause } from "@/lib/trips/getRouteRiskCause";
import { buildTestRoute } from "@/test/buildTestRoute";
import type { TripRoute } from "@/types/trips";

describe("getRouteRiskCause", () => {
  it("names the factor behind the route's worst stretch", () => {
    // The test route's worst checkpoint is Severe from wind.
    const cause = getRouteRiskCause({ route: buildTestRoute() });

    expect(cause?.level).toBe("severe");
    expect(cause?.factors.map(({ label }) => label)).toEqual(["Wind"]);
    expect(cause?.isLoadAdjusted).toBe(false);
  });

  it("collects every factor that reaches the worst level and notes the load", () => {
    const route = buildTestRoute();
    const windWithLoad = {
      level: "severe",
      score: 3,
      wind: "severe",
      rain: "low",
      snow: "low",
      load_adjusted: true,
    } as const;
    route.checkpoints[2].risk = windWithLoad;
    route.checkpoints[1].risk = { ...windWithLoad, wind: "low", rain: "severe", load_adjusted: false };

    const cause = getRouteRiskCause({ route });

    expect(cause?.factors.map(({ label }) => label)).toEqual(["Wind", "Rain"]);
    expect(cause?.isLoadAdjusted).toBe(true);
  });

  it("has nothing to say about a Low route", () => {
    const route: TripRoute = { ...buildTestRoute(), risk: { ...buildTestRoute().risk, worst_level: "low" } };

    expect(getRouteRiskCause({ route })).toBeNull();
  });
});

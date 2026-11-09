import { describe, expect, it } from "vitest";

import { buildTripRequest } from "@/lib/trips/buildTripRequest";

describe("buildTripRequest", () => {
  it("sends picked places as coordinates and typed text as-is", () => {
    const request = buildTripRequest({
      values: {
        origin: { text: "Dallas, Texas", place: { name: "Dallas, Texas", lat: 32.78, lon: -96.8 } },
        destination: { text: "  Chicago, IL ", place: null },
        departureTime: "2026-01-05T08:30",
        loadWeightLbs: 42000,
        sampleIntervalMiles: 25,
      },
    });

    expect(request.origin).toBe("32.78,-96.8");
    expect(request.destination).toBe("Chicago, IL");
    expect(request.load_weight_lbs).toBe(42000);
    expect(request.sample_interval_miles).toBe(25);
    // Local time from the datetime input, sent as an exact instant.
    expect(new Date(request.departure_time).getTime()).toBe(new Date("2026-01-05T08:30").getTime());
  });
});

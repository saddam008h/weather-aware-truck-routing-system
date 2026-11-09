import { describe, expect, it } from "vitest";

import { getDepartureInputLimits } from "@/lib/trips/getDepartureInputLimits";

describe("getDepartureInputLimits", () => {
  it("allows from now up to 7 days ahead, in the datetime-local format", () => {
    const now = new Date(2026, 10, 9, 18, 30); // local time, Nov 9 2026 6:30 PM

    expect(getDepartureInputLimits({ now })).toEqual({
      min: "2026-11-09T18:30",
      max: "2026-11-16T18:30",
    });
  });
});

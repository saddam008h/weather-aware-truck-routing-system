import { describe, expect, it } from "vitest";

import { describeRiskCause } from "@/lib/trips/describeRiskCause";
import type { CheckpointRisk } from "@/types/trips";

const risk = (overrides: Partial<CheckpointRisk>): CheckpointRisk => ({
  level: "low",
  score: 0,
  wind: "low",
  rain: "low",
  snow: "low",
  load_adjusted: false,
  ...overrides,
});

describe("describeRiskCause", () => {
  it("names the factor behind the level", () => {
    expect(describeRiskCause({ risk: risk({ level: "high", rain: "high" }), loadWeightLbs: 0 })).toBe(
      "High because of rain.",
    );
  });

  it("names every factor that ties for the worst level", () => {
    const allSevere = risk({ level: "severe", wind: "severe", rain: "severe", snow: "severe" });

    expect(describeRiskCause({ risk: allSevere, loadWeightLbs: 0 })).toBe("Severe because of wind, rain and snow.");
  });

  it("mentions the load when it raised the wind risk", () => {
    const windy = risk({ level: "severe", wind: "severe", load_adjusted: true });

    expect(describeRiskCause({ risk: windy, loadWeightLbs: 42_000 })).toBe(
      "Severe because of wind. The 42,000\u00a0lb load raises the wind risk.",
    );
  });

  it("leaves the load out when wind isn't the cause", () => {
    const rainy = risk({ level: "no_travel", rain: "no_travel", wind: "severe", load_adjusted: true });

    expect(describeRiskCause({ risk: rainy, loadWeightLbs: 42_000 })).toBe("No travel because of rain.");
  });

  it("says so when nothing stands out", () => {
    expect(describeRiskCause({ risk: risk({}), loadWeightLbs: 0 })).toBe("Wind, rain and snow are all Low.");
  });
});

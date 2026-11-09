import { describe, expect, it } from "vitest";

import { getRiskFactors } from "@/lib/trips/getRiskFactors";
import type { CheckpointRisk, CheckpointWeather } from "@/types/trips";

const weather: CheckpointWeather = { temperature_f: 40, wind_mph: 38.4, gust_mph: 50, rain_in_hr: 0.3, snow_in_hr: 0 };

const risk = (overrides: Partial<CheckpointRisk>): CheckpointRisk => ({
  level: "low",
  score: 0,
  wind: "low",
  rain: "low",
  snow: "low",
  load_adjusted: false,
  ...overrides,
});

describe("getRiskFactors", () => {
  it("formats each value the way the app shows it", () => {
    const values = getRiskFactors({ weather, risk: risk({}) }).map((factor) => `${factor.label} ${factor.value}`);

    expect(values).toEqual(["Wind 38 mph", "Rain 0.30 in/hr", "Snow 0.0 in/hr"]);
  });

  it("marks the factor that set the level as the cause", () => {
    const factors = getRiskFactors({ weather, risk: risk({ level: "high", rain: "high", wind: "moderate" }) });

    expect(factors.filter((factor) => factor.isCause).map((factor) => factor.key)).toEqual(["rain"]);
  });

  it("marks every factor that ties for the worst level", () => {
    const factors = getRiskFactors({ weather, risk: risk({ level: "high", wind: "high", rain: "high" }) });

    expect(factors.filter((factor) => factor.isCause).map((factor) => factor.key)).toEqual(["wind", "rain"]);
  });

  it("has no cause when the checkpoint is Low", () => {
    expect(getRiskFactors({ weather, risk: risk({}) }).some((factor) => factor.isCause)).toBe(false);
  });
});

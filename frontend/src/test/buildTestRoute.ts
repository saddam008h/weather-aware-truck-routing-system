import type { Checkpoint, RiskLevel, TripRoute } from "@/types/trips";

// Shared test fixture: a straight 138-mile route due
// north (two one-degree hops of ~69 mi), with checkpoints at mile 0, 50, 100 and the end.

const checkpoint = (mile: number, eta: string, level: RiskLevel | null): Checkpoint => ({
  mile,
  lat: 40 + mile / 69.09,
  lon: -100,
  eta,
  weather: null,
  risk: level ? { level, score: 0, wind: level, rain: "low", snow: "low", load_adjusted: false } : null,
});

export function buildTestRoute(): TripRoute {
  return {
    id: 1,
    summary: "Test Highway",
    distance_miles: 138.2,
    duration_minutes: 180,
    arrival_time: "2026-01-05T11:00:00Z",
    is_recommended: true,
    risk: {
      worst_level: "severe",
      average_score: 1,
      miles_by_level: { low: 100, moderate: 0, high: 0, severe: 38.2, no_travel: 0 },
      unknown_miles: 0,
    },
    geometry: [
      [40, -100],
      [41, -100],
      [42, -100],
    ],
    checkpoints: [
      checkpoint(0, "2026-01-05T08:00:00Z", "low"),
      checkpoint(50, "2026-01-05T09:00:00Z", "low"),
      checkpoint(100, "2026-01-05T10:00:00Z", "severe"),
      checkpoint(138.2, "2026-01-05T11:00:00Z", null),
    ],
  };
}

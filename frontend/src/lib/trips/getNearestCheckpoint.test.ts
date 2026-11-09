import { describe, expect, it } from "vitest";

import { getNearestCheckpoint } from "@/lib/trips/getNearestCheckpoint";
import { buildTestRoute } from "@/test/buildTestRoute";

describe("getNearestCheckpoint", () => {
  const route = buildTestRoute(); // checkpoints at miles 0, 50, 100, 138.2

  it("picks the checkpoint whose stretch of road covers the mile", () => {
    expect(getNearestCheckpoint({ route, mile: 74 }).mile).toBe(50);
    expect(getNearestCheckpoint({ route, mile: 76 }).mile).toBe(100);
  });

  it("uses the ends before departure and after arrival", () => {
    expect(getNearestCheckpoint({ route, mile: 0 }).mile).toBe(0);
    expect(getNearestCheckpoint({ route, mile: 138.2 }).mile).toBe(138.2);
  });
});

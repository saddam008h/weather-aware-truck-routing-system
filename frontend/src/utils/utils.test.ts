import { describe, expect, it } from "vitest";

import { formatDuration } from "@/utils/formatDuration";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

describe("formatDuration", () => {
  it.each([
    [45, "45 min"],
    [60, "1 h"],
    [1026, "17 h 6 min"],
    [59.6, "1 h"],
  ])("%s minutes -> %s", (minutes, expected) => {
    expect(formatDuration({ minutes })).toBe(expected);
  });
});

describe("getApiErrorMessage", () => {
  const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 400 });

  it("reads DRF's detail message", async () => {
    const response = jsonResponse({ detail: "There is no drivable route between these locations." });

    expect(await getApiErrorMessage({ response })).toBe("There is no drivable route between these locations.");
  });

  it("reads the first field error", async () => {
    const response = jsonResponse({ departure_time: ["Departure time is in the past."] });

    expect(await getApiErrorMessage({ response })).toBe("Departure time is in the past.");
  });

  it("returns null for a body it can't read", async () => {
    const response = new Response("<html>Bad gateway</html>", { status: 502 });

    expect(await getApiErrorMessage({ response })).toBeNull();
  });
});

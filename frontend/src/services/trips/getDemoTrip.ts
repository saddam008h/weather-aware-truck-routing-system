import { DEMO_TRIP_FILES } from "@/constants/trips";
import type { DemoTrip } from "@/types/trips";

/** The demo trip's plan and heatmap, served as static files with the app (no API call). */
export async function getDemoTrip(): Promise<DemoTrip> {
  // BASE_URL keeps the paths right if the app is ever hosted under a sub-folder.
  const [planResponse, heatmapResponse] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}${DEMO_TRIP_FILES.PLAN}`),
    fetch(`${import.meta.env.BASE_URL}${DEMO_TRIP_FILES.HEATMAP}`),
  ]);

  if (!planResponse.ok || !heatmapResponse.ok) {
    throw new Error("Failed to load the demo trip");
  }

  return { plan: await planResponse.json(), heatmap: await heatmapResponse.json() };
}

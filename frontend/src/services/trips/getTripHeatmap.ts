import { getApiBaseUrl } from "@/lib/apiHosts";
import { ApiError } from "@/types/shared";
import type { TripHeatmap, TripRequest } from "@/types/trips";
import { getApiErrorMessage } from "@/utils";

export async function getTripHeatmap({ request }: { request: TripRequest }): Promise<TripHeatmap> {
  const url = `${getApiBaseUrl()}/api/trips/heatmap/`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await getApiErrorMessage({ response });
    throw message ? new ApiError(message) : new Error(`Heatmap request failed with status ${response.status}`);
  }

  return response.json();
}

import { getApiBaseUrl } from "@/lib/apiHosts";
import { ApiError } from "@/types/shared";
import type { TripPlan, TripRequest } from "@/types/trips";
import { getApiErrorMessage } from "@/utils";

export async function planTrip({ request }: { request: TripRequest }): Promise<TripPlan> {
  const url = `${getApiBaseUrl()}/api/trips/plan/`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await getApiErrorMessage({ response });
    throw message ? new ApiError(message) : new Error(`Trip planning failed with status ${response.status}`);
  }

  return response.json();
}

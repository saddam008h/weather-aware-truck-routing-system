import { getApiBaseUrl } from "@/lib/apiHosts";
import type { Place } from "@/types/trips";

export async function searchPlaces({ query, signal }: { query: string; signal?: AbortSignal }): Promise<Place[]> {
  const url = `${getApiBaseUrl()}/api/geocode/?${new URLSearchParams({ q: query })}`;

  // `signal` lets React Query cancel the request when the user keeps typing.
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Place search failed with status ${response.status}`);
  }

  return response.json();
}

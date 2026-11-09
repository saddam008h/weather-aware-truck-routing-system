import { keepPreviousData, queryOptions, skipToken } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/shared";
import { MIN_PLACE_SEARCH_LENGTH } from "@/constants/trips";
import { searchPlaces } from "@/services/trips";

/** Place suggestions for a location input. Short queries don't hit the API at all. */
export function searchPlacesQueryOptions({ query }: { query: string }) {
  const trimmed = query.trim();
  const canSearch = trimmed.length >= MIN_PLACE_SEARCH_LENGTH;

  return queryOptions({
    queryKey: [QUERY_KEYS.PLACE_SUGGESTIONS, trimmed.toLowerCase()],
    queryFn: canSearch ? ({ signal }) => searchPlaces({ query: trimmed, signal }) : skipToken,
    // Places don't move, so a search result can be reused for the whole session.
    staleTime: Infinity,
    // Keep showing the last suggestions while the next search loads, instead of flashing empty.
    placeholderData: keepPreviousData,
  });
}

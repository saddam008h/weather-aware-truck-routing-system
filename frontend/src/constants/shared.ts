// Every React Query key in the app lives here, so they can't collide or drift apart.
export const QUERY_KEYS = {
  // -------------------------- Trips Query Keys --------------------------
  PLACE_SUGGESTIONS: "place-suggestions",
  TRIP_HEATMAP: "trip-heatmap",
};

export const DEFAULT_API_BASE_URL = "http://localhost:8000";

/** How long to wait after the last keystroke before searching. */
export const SEARCH_DEBOUNCE_MS = 300;

export const EARTH_RADIUS_MILES = 3958.8;

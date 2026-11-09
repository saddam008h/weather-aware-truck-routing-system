import type { LocationValue, TripFormValues, TripRequest } from "@/types/trips";

// A picked suggestion is sent as exact coordinates so the API doesn't geocode
// it again (and maybe land somewhere else). Free text is sent as typed.
const toLocationQuery = (location: LocationValue) =>
  location.place ? `${location.place.lat},${location.place.lon}` : location.text.trim();

/** Turns the form's values into the body the plan and heatmap endpoints expect. */
export function buildTripRequest({ values }: { values: TripFormValues }): TripRequest {
  return {
    origin: toLocationQuery(values.origin),
    destination: toLocationQuery(values.destination),
    // datetime-local has no time zone; new Date() reads it as the browser's local time.
    departure_time: new Date(values.departureTime).toISOString(),
    load_weight_lbs: values.loadWeightLbs,
    sample_interval_miles: values.sampleIntervalMiles,
  };
}

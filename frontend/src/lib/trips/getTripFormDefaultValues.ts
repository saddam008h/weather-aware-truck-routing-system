import { addMinutes, roundToNearestMinutes } from "date-fns";

import { DEFAULT_LOAD_WEIGHT_LBS, DEFAULT_SAMPLE_INTERVAL_MILES } from "@/constants/trips";
import type { TripFormValues } from "@/types/trips";
import { formatToDateTimeInputValue } from "@/utils";

/** Empty locations, departure at the next quarter hour, and typical load/interval defaults. */
export function getTripFormDefaultValues(): TripFormValues {
  const nextQuarterHour = roundToNearestMinutes(addMinutes(new Date(), 15), { nearestTo: 15, roundingMethod: "floor" });

  return {
    origin: { text: "", place: null },
    destination: { text: "", place: null },
    departureTime: formatToDateTimeInputValue({ date: nextQuarterHour }),
    loadWeightLbs: DEFAULT_LOAD_WEIGHT_LBS,
    sampleIntervalMiles: DEFAULT_SAMPLE_INTERVAL_MILES,
  };
}

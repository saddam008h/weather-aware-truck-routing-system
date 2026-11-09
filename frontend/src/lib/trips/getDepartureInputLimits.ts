import { addDays } from "date-fns";

import { MAX_DEPARTURE_DAYS_AHEAD } from "@/constants/trips";
import { formatToDateTimeInputValue } from "@/utils";

/**
 * `min` and `max` for the departure <input type="datetime-local">, so the
 * browser's picker greys out what the API would reject anyway: anything in the
 * past, and anything past the forecast range. Typed values are still checked by
 * tripFormSchema.
 */
export function getDepartureInputLimits({ now = new Date() }: { now?: Date } = {}) {
  return {
    min: formatToDateTimeInputValue({ date: now }),
    max: formatToDateTimeInputValue({ date: addDays(now, MAX_DEPARTURE_DAYS_AHEAD) }),
  };
}

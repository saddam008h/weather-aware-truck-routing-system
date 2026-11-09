import { addDays, subMinutes } from "date-fns";
import { z } from "zod";

import {
  DEPARTURE_GRACE_MINUTES,
  MAX_DEPARTURE_DAYS_AHEAD,
  MAX_LOAD_WEIGHT_LBS,
  SAMPLE_INTERVAL_OPTIONS,
} from "@/constants/trips";

const placeSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
});

// Either a picked suggestion, or at least some text the API can try to geocode.
const locationSchema = z
  .object({ text: z.string(), place: placeSchema.nullable() })
  .refine((location) => location.place || location.text.trim().length >= 2, {
    error: "Enter a city or address",
  });

const isWithinForecastWindow = (value: string) => {
  const departure = new Date(value);
  const now = new Date();
  return departure >= subMinutes(now, DEPARTURE_GRACE_MINUTES) && departure <= addDays(now, MAX_DEPARTURE_DAYS_AHEAD);
};

// Mirrors the API's own validation so most mistakes are caught before a request goes out.
export const tripFormSchema = z.object({
  origin: locationSchema,
  destination: locationSchema,
  departureTime: z
    .string()
    .min(1, { error: "Pick a departure time" })
    .refine(isWithinForecastWindow, { error: `Pick a time within the next ${MAX_DEPARTURE_DAYS_AHEAD} days` }),
  loadWeightLbs: z
    .number({ error: "Enter the load weight" })
    .int({ error: "Use whole pounds" })
    .min(0, { error: "Weight can't be negative" })
    .max(MAX_LOAD_WEIGHT_LBS, { error: `Max ${MAX_LOAD_WEIGHT_LBS.toLocaleString()} lb` }),
  sampleIntervalMiles: z.literal(SAMPLE_INTERVAL_OPTIONS.map((option) => option.value)),
});

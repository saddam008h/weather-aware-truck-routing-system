import { addHours, startOfHour } from "date-fns";

/**
 * The moment a forecast slider position stands for. Hour 0 is the departure
 * hour (rounded down), which is how the API lines up its heatmap frames too.
 */
export function getForecastTime({ departureTime, hour }: { departureTime: string; hour: number }) {
  return addHours(startOfHour(new Date(departureTime)), hour);
}

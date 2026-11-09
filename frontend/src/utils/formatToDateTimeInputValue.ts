import { format } from "date-fns";

/** The "2026-11-09T15:45" string an <input type="datetime-local"> expects, in local time. */
export function formatToDateTimeInputValue({ date }: { date: Date }) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

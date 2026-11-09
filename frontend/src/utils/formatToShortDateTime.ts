import { format } from "date-fns";

/** "Mon, Nov 9, 3:45 PM" in the browser's time zone. */
export function formatToShortDateTime({ date }: { date: string | Date }) {
  return format(new Date(date), "EEE, MMM d, h:mm a");
}

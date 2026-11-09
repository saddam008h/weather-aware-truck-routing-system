import { format } from "date-fns";

/** "Mon 3:45 PM" in the browser's time zone. */
export function formatToWeekdayTime({ date }: { date: string | Date }) {
  return format(new Date(date), "EEE h:mm a");
}

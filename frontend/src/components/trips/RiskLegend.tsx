import { RISK_LEVEL_ORDER, RISK_LEVELS, UNKNOWN_RISK } from "@/constants/trips";
import { cn } from "@/utils";

/**
 * One color key for every route's risk bar, Low to No travel in the bar's order.
 * "No forecast" only shows up when some route actually has stretches without one.
 */
export function RiskLegend({ showUnknown }: { showUnknown: boolean }) {
  const items = RISK_LEVEL_ORDER.map((level) => RISK_LEVELS[level]);
  if (showUnknown) {
    items.push(UNKNOWN_RISK);
  }

  return (
    <ul className="flex flex-wrap gap-x-md gap-y-xs text-xs text-text-secondary" aria-label="Risk colors">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-xs">
          <span className={cn("size-md shrink-0 rounded-xs", item.fillClassName)} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

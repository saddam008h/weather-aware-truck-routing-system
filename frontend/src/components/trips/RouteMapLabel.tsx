import { Star } from "lucide-react";

import { RouteSummary } from "@/components/trips/RouteSummary";
import { getRiskLevelDetails } from "@/lib/trips";
import type { TripRoute } from "@/types/trips";
import { cn, formatDuration } from "@/utils";

/** A route's chip on the map. Hovering (or tapping) it shows the route summary above it. */
export function RouteMapLabel({ route, isSelected }: { route: TripRoute; isSelected: boolean }) {
  const worstRisk = getRiskLevelDetails({ level: route.risk.worst_level });
  const summaryId = `route-${route.id}-summary`;

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={`Select route ${route.id}`}
        aria-describedby={summaryId}
        className={cn(
          "peer flex cursor-pointer items-center gap-xs rounded-full border px-md py-xxs text-xs font-medium whitespace-nowrap shadow-md",
          isSelected
            ? "border-button-primary bg-button-primary text-text-button-primary"
            : "border-border-primary bg-background text-text-primary",
        )}
      >
        {route.is_recommended && <Star className="size-lg" />}
        Route {route.id} · {formatDuration({ minutes: route.duration_minutes })}
        {/* Worst risk on the route, as a dot in its color. */}
        <span className={cn("size-md rounded-full", worstRisk.fillClassName)} />
      </button>

      {/* Plain CSS, so moving the mouse over chips never re-renders the map. Opens on hover or
          keyboard focus (focus-visible), not on a mouse click, so it doesn't stay stuck open.
          The bottom padding bridges the gap to the chip, so the card stays open on the way up. */}
      <div
        id={summaryId}
        role="tooltip"
        className="absolute bottom-full left-1/2 hidden w-c-xs -translate-x-1/2 pb-sm group-hover:block peer-focus-visible:block"
      >
        {/* Same content as the sidebar card, just compact. */}
        <span className="block rounded-lg border border-border-primary bg-background p-lg text-left whitespace-normal shadow-lg">
          <RouteSummary route={route} compact />
        </span>
      </div>
    </div>
  );
}

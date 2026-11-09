import { Star } from "lucide-react";

import { AverageRiskScore } from "@/components/trips/AverageRiskScore";
import { RiskBadge } from "@/components/trips/RiskBadge";
import { RouteRiskBar } from "@/components/trips/RouteRiskBar";
import { RouteStat } from "@/components/trips/RouteStat";
import type { TripRoute } from "@/types/trips";
import { cn, formatDuration, formatToLocaleNumber, formatToWeekdayTime } from "@/utils";

interface RouteSummaryProps {
  route: TripRoute;
  /** Smaller text and the trip stats on one line, for the map's hover card. */
  compact?: boolean;
}

/**
 * Everything shown about one route option: name, recommended tag, worst risk,
 * roads, distance/time/arrival, the risk bar and average risk.
 *
 * Shared by the sidebar card and the map's hover card so the two always match.
 * Spans only, because the sidebar version sits inside a button.
 */
export function RouteSummary({ route, compact = false }: RouteSummaryProps) {
  const distance = `${formatToLocaleNumber({ value: route.distance_miles })} mi`;
  const driveTime = formatDuration({ minutes: route.duration_minutes });
  const arrival = formatToWeekdayTime({ date: route.arrival_time });

  return (
    <span className={cn("flex flex-col", compact ? "gap-sm" : "gap-md")}>
      <span className="flex items-center justify-between gap-md">
        <span className="flex items-center gap-sm">
          <span className={cn("font-semibold text-text-primary", compact ? "text-sm" : "text-md")}>
            Route {route.id}
          </span>
          {route.is_recommended && (
            <span className="inline-flex items-center gap-xxs rounded-full bg-bg-brand-subtle px-sm py-xxs text-xs font-medium text-text-brand">
              <Star className="size-lg" />
              Recommended
            </span>
          )}
        </span>
        <RiskBadge level={route.risk.worst_level} />
      </span>

      <span className={cn("truncate text-text-secondary", compact ? "text-xs" : "text-sm")}>
        via {route.summary || "local roads"}
      </span>

      {compact ? (
        <span className="text-xs text-text-primary">
          {distance} · {driveTime} · arrives {arrival}
        </span>
      ) : (
        <span className="grid grid-cols-3 gap-md">
          <RouteStat label="Distance" value={distance} />
          <RouteStat label="Drive time" value={driveTime} />
          <RouteStat label="Arrives" value={arrival} />
        </span>
      )}

      <RouteRiskBar risk={route.risk} totalMiles={route.distance_miles} />
      <AverageRiskScore score={route.risk.average_score} />
    </span>
  );
}

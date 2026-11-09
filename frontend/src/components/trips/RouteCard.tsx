import { RouteSummary } from "@/components/trips/RouteSummary";
import type { TripRoute } from "@/types/trips";
import { cn } from "@/utils";

interface RouteCardProps {
  route: TripRoute;
  isSelected: boolean;
  onSelect: () => void;
}

/** One route option in the sidebar. Clicking it selects the route on the map and in the checkpoint list. */
export function RouteCard({ route, isSelected, onSelect }: RouteCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={cn(
        "w-full cursor-pointer rounded-lg border bg-background p-lg text-left transition-colors hover:border-border-brand",
        isSelected ? "border-border-brand shadow-md" : "border-border-primary",
      )}
    >
      <RouteSummary route={route} />
    </button>
  );
}

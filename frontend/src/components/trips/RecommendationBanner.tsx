import { ShieldCheck } from "lucide-react";

import type { TripPlan } from "@/types/trips";

/** Which route we recommend and the one criterion that decided it (the API writes the reason). */
export function RecommendationBanner({ tripPlan }: { tripPlan: TripPlan }) {
  return (
    <div className="flex flex-col gap-xs rounded-lg border border-border-brand bg-bg-brand-subtle p-lg">
      <p className="flex items-center gap-sm text-md font-semibold text-text-primary">
        <ShieldCheck className="size-xl text-text-brand" />
        Route {tripPlan.recommended_route_id} is the recommended route
      </p>
      <p className="text-sm text-text-secondary">{tripPlan.recommendation}</p>
    </div>
  );
}
